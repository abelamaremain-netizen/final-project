package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.CollateralDto;
import et.edu.woldia.coop.entity.Collateral;
import et.edu.woldia.coop.entity.Loan;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.CollateralMapper;
import et.edu.woldia.coop.repository.CollateralRepository;
import et.edu.woldia.coop.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for collateral management operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CollateralService {
    
    private final CollateralRepository collateralRepository;
    private final CollateralMapper collateralMapper;
    private final LoanRepository loanRepository;
    private final AccountService accountService;
    private final AuditService auditService;
    private final ConfigurationService configurationService;
    
    /**
     * Add collateral to loan application
     */
    @Transactional
    public CollateralDto addCollateral(UUID applicationId, CollateralDto dto, String processedBy) {
        log.info("Adding collateral to application: {}", applicationId);

        Collateral collateral = collateralMapper.toEntity(dto);
        collateral.setLoanId(applicationId);
        collateral.setStatus(Collateral.CollateralStatus.PLEDGED);
        collateral.setPledgeDate(LocalDate.now());

        // ── Pre-save validations ──────────────────────────────────────────────

        // OWN_SAVINGS: account must exist and have sufficient available balance
        if (collateral.getCollateralType() == Collateral.CollateralType.OWN_SAVINGS) {
            if (collateral.getAccountId() == null) {
                throw new ValidationException("OWN_SAVINGS collateral requires an account ID");
            }
            if (collateral.getPledgedAmount() == null || collateral.getPledgedAmount().getAmount() == null) {
                throw new ValidationException("OWN_SAVINGS collateral requires a pledged amount");
            }
        }

        // GUARANTOR: guarantor account must be specified and have sufficient balance
        if (collateral.getCollateralType() == Collateral.CollateralType.GUARANTOR) {
            if (collateral.getGuarantorMemberId() == null) {
                throw new ValidationException("GUARANTOR collateral requires a guarantor member ID");
            }
            if (collateral.getGuarantorAccountId() == null) {
                throw new ValidationException("GUARANTOR collateral requires the guarantor's account ID to lock funds");
            }
            if (collateral.getGuaranteedAmount() == null || collateral.getGuaranteedAmount().getAmount() == null) {
                throw new ValidationException("GUARANTOR collateral requires a guaranteed amount");
            }
        }

        // FIXED_ASSET / VEHICLE: validate year is reasonable
        if (collateral.getCollateralType() == Collateral.CollateralType.FIXED_ASSET
                && collateral.getAssetType() == Collateral.AssetType.VEHICLE
                && collateral.getVehicleYear() != null) {
            int currentYear = LocalDate.now().getYear();
            if (collateral.getVehicleYear() > currentYear) {
                throw new ValidationException("Vehicle year cannot be in the future");
            }
            if (collateral.getVehicleYear() < 1900) {
                throw new ValidationException("Vehicle year is not valid");
            }
            // Eagerly check age limit so the user gets feedback immediately
            try {
                SystemConfiguration config = configurationService.getCurrentConfiguration();
                int vehicleAge = currentYear - collateral.getVehicleYear();
                int maxAge = config.getVehicleAgeLimitYears();
                if (maxAge > 0 && vehicleAge > maxAge) {
                    throw new ValidationException(
                        "Vehicle is too old (" + vehicleAge + " years). Maximum allowed age is " + maxAge + " years."
                    );
                }
            } catch (ValidationException ve) {
                throw ve;
            } catch (Exception ignored) {
                // config not available — skip early check, approval will catch it
            }
        }

        Collateral saved = collateralRepository.save(collateral);

        // ── Lock funds on the relevant account (fail hard — don't swallow) ────
        if (saved.getCollateralType() == Collateral.CollateralType.OWN_SAVINGS
                && saved.getAccountId() != null
                && saved.getPledgedAmount() != null) {
            accountService.pledgeAmount(saved.getAccountId(),
                saved.getPledgedAmount().getAmount(),
                "Collateral for application " + applicationId, processedBy);
        } else if (saved.getCollateralType() == Collateral.CollateralType.GUARANTOR
                && saved.getGuarantorAccountId() != null
                && saved.getGuaranteedAmount() != null) {
            accountService.pledgeAmount(saved.getGuarantorAccountId(),
                saved.getGuaranteedAmount().getAmount(),
                "Guarantor collateral for application " + applicationId, processedBy);
        }

        log.info("Collateral added: {} for application {}", saved.getId(), applicationId);

        try { auditService.logAction(null, processedBy, "CREATE", "COLLATERAL", saved.getId(),
            "Collateral added (" + saved.getCollateralType() + ") for application " + applicationId); } catch (Exception ignored) {}

        return collateralMapper.toDto(saved);
    }
    
    /**
     * Get all collateral for loan application
     */
    @Transactional(readOnly = true)
    public List<CollateralDto> getCollateralForApplication(UUID applicationId) {
        return collateralRepository.findByApplicationId(applicationId).stream()
            .map(collateralMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all collateral for loan
     */
    @Transactional(readOnly = true)
    public List<CollateralDto> getCollateralForLoan(UUID loanId) {
        return collateralRepository.findByLoanId(loanId).stream()
            .map(collateralMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get collateral by ID
     */
    @Transactional(readOnly = true)
    public CollateralDto getCollateralById(UUID id) {
        Collateral collateral = findCollateralById(id);
        return collateralMapper.toDto(collateral);
    }
    
    /**
     * Update collateral
     */
    @Transactional
    public CollateralDto updateCollateral(UUID id, CollateralDto dto, String updatedBy) {
        log.info("Updating collateral: {}", id);
        
        Collateral collateral = findCollateralById(id);
        
        if (collateral.getStatus() == Collateral.CollateralStatus.RELEASED ||
            collateral.getStatus() == Collateral.CollateralStatus.LIQUIDATED) {
            throw new ValidationException("Cannot update collateral that has been released or liquidated");
        }
        
        // Update fields from DTO
        collateral.setCollateralType(Collateral.CollateralType.valueOf(dto.getCollateralType()));
        collateral.setCollateralValue(collateralMapper.toEntity(dto).getCollateralValue());
        collateral.setAppraisalValue(collateralMapper.toEntity(dto).getAppraisalValue());
        collateral.setAppraisalDate(dto.getAppraisalDate());
        collateral.setAppraisedBy(dto.getAppraisedBy());
        collateral.setAssetDescription(dto.getAssetDescription());
        
        // Update type-specific fields
        Collateral.CollateralType type = Collateral.CollateralType.valueOf(dto.getCollateralType());
        if (type == Collateral.CollateralType.OWN_SAVINGS) {
            collateral.setAccountId(dto.getAccountId());
            collateral.setPledgedAmount(collateralMapper.toEntity(dto).getPledgedAmount());
        } else if (type == Collateral.CollateralType.GUARANTOR) {
            collateral.setGuarantorMemberId(dto.getGuarantorMemberId());
            collateral.setGuarantorAccountId(dto.getGuarantorAccountId());
            collateral.setGuaranteedAmount(collateralMapper.toEntity(dto).getGuaranteedAmount());
        } else if (type == Collateral.CollateralType.EXTERNAL_COOPERATIVE) {
            collateral.setExternalCooperativeName(dto.getExternalCooperativeName());
            collateral.setExternalAccountNumber(dto.getExternalAccountNumber());
            collateral.setVerificationDocument(dto.getVerificationDocument());
        } else if (type == Collateral.CollateralType.FIXED_ASSET) {
            collateral.setAssetType(dto.getAssetType() != null ? Collateral.AssetType.valueOf(dto.getAssetType()) : null);
            collateral.setVehicleYear(dto.getVehicleYear());
        }
        
        Collateral updated = collateralRepository.save(collateral);
        
        log.info("Collateral updated: {}", id);

        try { auditService.logAction(null, updatedBy, "UPDATE", "COLLATERAL", id,
            "Collateral updated"); } catch (Exception ignored) {}

        return collateralMapper.toDto(updated);
    }
    
    /**
     * Delete collateral
     */
    @Transactional
    public void deleteCollateral(UUID id) {
        log.info("Deleting collateral: {}", id);
        
        Collateral collateral = findCollateralById(id);
        
        if (collateral.getStatus() == Collateral.CollateralStatus.PLEDGED) {
            throw new ValidationException("Cannot delete pledged collateral");
        }
        
        collateralRepository.delete(collateral);
        
        log.info("Collateral deleted: {}", id);
    }
    
    /**
     * Release collateral
     */
    @Transactional
    public void releaseCollateral(UUID id, String releasedBy) {
        log.info("Releasing collateral: {}", id);
        
        Collateral collateral = findCollateralById(id);
        
        if (collateral.getStatus() == Collateral.CollateralStatus.RELEASED) {
            throw new ValidationException("Collateral is already released");
        }
        
        if (collateral.getStatus() == Collateral.CollateralStatus.LIQUIDATED) {
            throw new ValidationException("Cannot release liquidated collateral");
        }

        // Business rule: collateral can only be released after the linked loan is fully paid off.
        UUID loanId = collateral.getLoanId();
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ValidationException(
                "Collateral is not linked to an existing loan (loanId=" + loanId + "). Cannot release."
            ));
        if (loan.getStatus() != Loan.LoanStatus.PAID_OFF) {
            throw new ValidationException(
                "Cannot release collateral unless loan is PAID_OFF. Current loan status: " + loan.getStatus()
            );
        }
        
        collateral.setStatus(Collateral.CollateralStatus.RELEASED);
        collateral.setReleaseDate(LocalDate.now());
        
        collateralRepository.save(collateral);
        
        // Release the locked amount on the account
        try {
            if (collateral.getCollateralType() == Collateral.CollateralType.OWN_SAVINGS
                    && collateral.getAccountId() != null
                    && collateral.getPledgedAmount() != null) {
                accountService.releaseAmount(collateral.getAccountId(),
                    collateral.getPledgedAmount().getAmount(),
                    "Collateral released: " + id, releasedBy);
            } else if (collateral.getCollateralType() == Collateral.CollateralType.GUARANTOR
                    && collateral.getGuarantorAccountId() != null
                    && collateral.getGuaranteedAmount() != null) {
                accountService.releaseAmount(collateral.getGuarantorAccountId(),
                    collateral.getGuaranteedAmount().getAmount(),
                    "Guarantor collateral released: " + id, releasedBy);
            }
        } catch (Exception e) {
            log.warn("Could not release pledged amount on account for collateral {}: {}", id, e.getMessage());
        }
        
        log.info("Collateral released: {} by {}", id, releasedBy);

        try { auditService.logAction(null, releasedBy, "RELEASE", "COLLATERAL", id,
            "Collateral released for loan " + collateral.getLoanId()); } catch (Exception ignored) {}
    }
    
    /**
     * Liquidate collateral
     */
    @Transactional
    public void liquidateCollateral(UUID id, String liquidatedBy) {
        log.info("Liquidating collateral: {}", id);
        
        Collateral collateral = findCollateralById(id);
        
        if (collateral.getStatus() == Collateral.CollateralStatus.LIQUIDATED) {
            throw new ValidationException("Collateral is already liquidated");
        }
        
        if (collateral.getStatus() == Collateral.CollateralStatus.RELEASED) {
            throw new ValidationException("Cannot liquidate released collateral");
        }

        // Business rule: collateral can only be liquidated when the linked loan is defaulted.
        UUID loanId = collateral.getLoanId();
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ValidationException(
                "Collateral is not linked to an existing loan (loanId=" + loanId + "). Cannot liquidate."
            ));
        if (loan.getStatus() != Loan.LoanStatus.DEFAULTED) {
            throw new ValidationException(
                "Cannot liquidate collateral unless loan is DEFAULTED. Current loan status: " + loan.getStatus()
            );
        }
        
        collateral.setStatus(Collateral.CollateralStatus.LIQUIDATED);
        
        collateralRepository.save(collateral);
        
        log.info("Collateral liquidated: {} by {}", id, liquidatedBy);

        try { auditService.logAction(null, liquidatedBy, "LIQUIDATE", "COLLATERAL", id,
            "Collateral liquidated for defaulted loan " + collateral.getLoanId()); } catch (Exception ignored) {}
    }
    
    /**
     * Find collateral by ID or throw exception
     */
    private Collateral findCollateralById(UUID id) {
        return collateralRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Collateral not found with ID: " + id));
    }
}
