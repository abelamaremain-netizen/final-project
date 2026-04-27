package et.edu.woldia.coop.dto;

import et.edu.woldia.coop.entity.RoleAssignmentAudit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for role assignment audit records.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignmentAuditDto {
    
    private UUID id;
    private UUID userId;
    private UUID roleId;
    private RoleAssignmentAudit.Action action;
    private String performedBy;
    private LocalDateTime performedAt;
    private String reason;
}
