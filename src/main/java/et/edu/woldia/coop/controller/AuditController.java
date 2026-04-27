package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.AuditLogDto;
import et.edu.woldia.coop.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for audit logging operations.
 */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit", description = "Audit logging API")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {
    
    private final AuditService auditService;
    
    /**
     * Get audit trail with filters
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('AUDITOR', 'MANAGER', 'ADMINISTRATOR')")
    @Operation(summary = "Get audit trail with filters")
    public ResponseEntity<Page<AuditLogDto>> getAuditTrail(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Pageable pageable) {

        LocalDateTime start = startDate != null && !startDate.isBlank()
            ? java.time.LocalDate.parse(startDate).atStartOfDay() : null;
        LocalDateTime end = endDate != null && !endDate.isBlank()
            ? java.time.LocalDate.parse(endDate).atTime(23, 59, 59) : null;

        Page<AuditLogDto> logs = auditService.getAuditTrail(
            userId, entityType, action, start, end, pageable);

        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get audit trail for entity
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('AUDITOR', 'MANAGER', 'LOAN_OFFICER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get audit trail for specific entity")
    public ResponseEntity<List<AuditLogDto>> getAuditTrailForEntity(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {
        
        List<AuditLogDto> logs = auditService.getAuditTrailForEntity(entityType, entityId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Get audit trail for user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('AUDITOR', 'MANAGER', 'ADMINISTRATOR')")
    @Operation(summary = "Get audit trail for specific user")
    public ResponseEntity<Page<AuditLogDto>> getAuditTrailForUser(
            @PathVariable UUID userId,
            Pageable pageable) {
        
        Page<AuditLogDto> logs = auditService.getAuditTrailForUser(userId, pageable);
        return ResponseEntity.ok(logs);
    }
}
