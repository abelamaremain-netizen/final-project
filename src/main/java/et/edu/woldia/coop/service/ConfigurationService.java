package et.edu.woldia.coop.service;

import et.edu.woldia.coop.entity.ConfigurationLock;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.repository.ConfigurationLockRepository;
import et.edu.woldia.coop.repository.SystemConfigurationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing system configuration with versioning.
 * 
 * Configuration parameters are versioned to ensure transactional integrity.
 * Transactional parameters (e.g., loan interest rates) are locked at transaction time,
 * while reference parameters (e.g., share price) always use current values.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConfigurationService {
    
    private final SystemConfigurationRepository configurationRepository;
    private final ConfigurationLockRepository configurationLockRepository;
    private final AuditService auditService;
    
    /**
     * Get the current (latest) system configuration
     */
    @Transactional(readOnly = true)
    public SystemConfiguration getCurrentConfiguration() {
        return configurationRepository.findCurrent()
            .orElseThrow(() -> new ResourceNotFoundException("No system configuration found"));
    }
    
    /**
     * Get configuration effective at a specific date (accepts date-only or datetime)
     */
    @Transactional(readOnly = true)
    public SystemConfiguration getConfigurationAtDate(LocalDate date) {
        return configurationRepository.findByEffectiveDate(date.atStartOfDay())
            .orElseThrow(() -> new ResourceNotFoundException(
                "No configuration found for date: " + date));
    }
    
    /**
     * Get configuration by version number
     */
    @Transactional(readOnly = true)
    public SystemConfiguration getConfigurationVersion(Integer version) {
        return configurationRepository.findByVersion(version)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Configuration version not found: " + version));
    }
    
    /**
     * Get all configuration versions (history)
     */
    @Transactional(readOnly = true)
    public List<SystemConfiguration> getConfigurationHistory() {
        return configurationRepository.findAll();
    }
    
    /**
     * Create a new configuration version
     */
    @Transactional
    public SystemConfiguration createNewConfiguration(SystemConfiguration config, String createdBy) {
        // Validate configuration
        validateConfiguration(config);
        
        // Set version and metadata
        Integer nextVersion = configurationRepository.getNextVersion();
        config.setVersion(nextVersion);
        config.setCreatedBy(createdBy);
        // Use provided effectiveDate if set and in the future; otherwise default to now
        if (config.getEffectiveDate() == null || config.getEffectiveDate().isBefore(LocalDateTime.now())) {
            config.setEffectiveDate(LocalDateTime.now());
        }
        
        log.info("Creating new configuration version {} by {}, effective {}", nextVersion, createdBy, config.getEffectiveDate());

        SystemConfiguration saved = configurationRepository.save(config);

        try { auditService.logAction(null, createdBy, "CREATE", "CONFIGURATION", saved.getId(),
            "System configuration version " + nextVersion + " published, effective " + saved.getEffectiveDate()); } catch (Exception ignored) {}

        return saved;
    }
    
    /**
     * Lock configuration for a transaction
     * 
     * This ensures the transaction uses a specific configuration version
     * even if the configuration changes later.
     */
    @Transactional
    public SystemConfiguration lockConfigurationForTransaction(
            String transactionType, 
            UUID transactionId,
            String lockedBy) {
        
        // Check if already locked
        if (configurationLockRepository.existsByTransactionTypeAndTransactionId(transactionType, transactionId)) {
            // Return the locked configuration
            ConfigurationLock existingLock = configurationLockRepository
                .findByTransactionTypeAndTransactionId(transactionType, transactionId)
                .orElseThrow();
            return getConfigurationVersion(existingLock.getConfigurationVersion());
        }
        
        // Get current configuration
        SystemConfiguration currentConfig = getCurrentConfiguration();
        
        // Create lock
        ConfigurationLock lock = new ConfigurationLock();
        lock.setTransactionType(transactionType);
        lock.setTransactionId(transactionId);
        lock.setConfigurationVersion(currentConfig.getVersion());
        lock.setLockedBy(lockedBy);
        lock.setLockedDate(LocalDateTime.now());
        
        configurationLockRepository.save(lock);
        
        log.info("Locked configuration version {} for {} transaction {}", 
            currentConfig.getVersion(), transactionType, transactionId);
        
        return currentConfig;
    }
    
    /**
     * Get the locked configuration for a transaction
     */
    @Transactional(readOnly = true)
    public SystemConfiguration getLockedConfiguration(String transactionType, UUID transactionId) {
        ConfigurationLock lock = configurationLockRepository
            .findByTransactionTypeAndTransactionId(transactionType, transactionId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No configuration lock found for " + transactionType + " " + transactionId));
        
        return getConfigurationVersion(lock.getConfigurationVersion());
    }
    
    /**
     * Validate configuration parameters
     */
    private void validateConfiguration(SystemConfiguration config) {
        // Validate interest rates
        if (config.getSavingsInterestRate().doubleValue() < 0 || 
            config.getSavingsInterestRate().doubleValue() > 1) {
            throw new ValidationException("Savings interest rate must be between 0 and 1");
        }
        
        if (config.getLoanInterestRateMin().doubleValue() < 0 || 
            config.getLoanInterestRateMin().doubleValue() > 1) {
            throw new ValidationException("Loan interest rate min must be between 0 and 1");
        }
        
        if (config.getLoanInterestRateMax().doubleValue() < 0 || 
            config.getLoanInterestRateMax().doubleValue() > 1) {
            throw new ValidationException("Loan interest rate max must be between 0 and 1");
        }
        
        if (config.getLoanInterestRateMin().compareTo(config.getLoanInterestRateMax()) > 0) {
            throw new ValidationException("Loan interest rate min cannot be greater than max");
        }
        
        // Validate percentages
        if (config.getLendingLimitPercentage().doubleValue() < 0 || 
            config.getLendingLimitPercentage().doubleValue() > 1) {
            throw new ValidationException("Lending limit percentage must be between 0 and 1");
        }
        
        if (config.getFixedAssetLtvRatio().doubleValue() < 0 || 
            config.getFixedAssetLtvRatio().doubleValue() > 1) {
            throw new ValidationException("Fixed asset LTV ratio must be between 0 and 1");
        }
        
        // Validate positive values
        if (config.getMinimumSharesRequired() < 0) {
            throw new ValidationException("Minimum shares required must be positive");
        }
        
        if (config.getMaximumSharesAllowed() != null && config.getMaximumSharesAllowed() < config.getMinimumSharesRequired()) {
            throw new ValidationException("Maximum shares cannot be less than minimum shares");
        }
        
        // Validate money amounts
        if (config.getRegistrationFee().isNegative()) {
            throw new ValidationException("Registration fee cannot be negative");
        }
        
        if (config.getSharePricePerShare().isNegative()) {
            throw new ValidationException("Share price cannot be negative");
        }
        
        if (config.getMinimumMonthlyDeduction().isNegative()) {
            throw new ValidationException("Minimum monthly deduction cannot be negative");
        }
        
        if (config.getMaximumLoanCapPerMember().isNegative()) {
            throw new ValidationException("Maximum loan cap cannot be negative");
        }
        
        if (config.getMinimumLoanAmount().isNegative()) {
            throw new ValidationException("Minimum loan amount cannot be negative");
        }
    }
}
