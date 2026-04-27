package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.AuditLogDto;
import et.edu.woldia.coop.entity.AuditLog;
import et.edu.woldia.coop.repository.AuditLogRepository;
import et.edu.woldia.coop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for audit logging operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Resolve user ID from username — looks up the User table.
     */
    private UUID resolveUserId(String username) {
        if (username == null) return null;
        return userRepository.findByUsername(username)
            .map(u -> u.getId())
            .orElse(null);
    }

    /**
     * Log an action (uses separate transaction to ensure audit is saved even if main transaction fails)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(UUID userId, String username, String action,
                          String entityType, UUID entityId, String description) {
        logAction(userId, username, action, entityType, entityId, description, null);
    }

    /**
     * Log an action with IP address
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(UUID userId, String username, String action,
                         String entityType, UUID entityId, String description,
                         String ipAddress) {
        try {
            // Auto-resolve userId from username if not provided
            UUID resolvedUserId = userId != null ? userId : resolveUserId(username);

            AuditLog auditLog = new AuditLog();
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setUserId(resolvedUserId);
            auditLog.setUsername(username);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setDescription(description);
            auditLog.setIpAddress(ipAddress);
            auditLog.setStatus(AuditLog.AuditStatus.SUCCESS);

            auditLogRepository.save(auditLog);

        } catch (Exception e) {
            log.error("Error saving audit log: {}", e.getMessage());
        }
    }

    /**
     * Log a failed action
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logFailedAction(UUID userId, String username, String action,
                               String entityType, UUID entityId, String errorMessage) {
        try {
            UUID resolvedUserId = userId != null ? userId : resolveUserId(username);

            AuditLog auditLog = new AuditLog();
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setUserId(resolvedUserId);
            auditLog.setUsername(username);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setDescription("Failed: " + action);
            auditLog.setStatus(AuditLog.AuditStatus.FAILURE);
            auditLog.setErrorMessage(errorMessage);

            auditLogRepository.save(auditLog);

        } catch (Exception e) {
            log.error("Error saving failed audit log: {}", e.getMessage());
        }
    }

    /**
     * Get audit trail with filters
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditTrail(UUID userId, String entityType, String action,
                                           LocalDateTime startDate, LocalDateTime endDate,
                                           Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findWithFilters(
            userId != null ? userId.toString() : null,
            entityType,
            action,
            startDate != null ? startDate.toString() : null,
            endDate != null ? endDate.toString() : null,
            pageable);

        return logs.map(this::toDto);
    }

    /**
     * Get audit trail for entity
     */
    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditTrailForEntity(String entityType, UUID entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get audit trail for user
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditTrailForUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable)
            .map(this::toDto);
    }

    /**
     * Convert entity to DTO
     */
    private AuditLogDto toDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setTimestamp(log.getTimestamp());
        dto.setUserId(log.getUserId());
        dto.setUsername(log.getUsername());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setDescription(log.getDescription());
        dto.setIpAddress(log.getIpAddress());
        dto.setStatus(log.getStatus().name());
        dto.setErrorMessage(log.getErrorMessage());

        return dto;
    }
}