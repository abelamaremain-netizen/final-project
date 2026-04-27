package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.RoleAssignmentAuditDto;
import et.edu.woldia.coop.entity.RoleAssignmentAudit;
import org.springframework.stereotype.Component;

/**
 * Mapper for RoleAssignmentAudit entity and DTO.
 */
@Component
public class RoleAssignmentAuditMapper {
    
    public RoleAssignmentAuditDto toDto(RoleAssignmentAudit entity) {
        if (entity == null) {
            return null;
        }
        
        return RoleAssignmentAuditDto.builder()
            .id(entity.getId())
            .userId(entity.getUserId())
            .roleId(entity.getRoleId())
            .action(entity.getAction())
            .performedBy(entity.getPerformedBy())
            .performedAt(entity.getPerformedAt())
            .reason(entity.getReason())
            .build();
    }
}
