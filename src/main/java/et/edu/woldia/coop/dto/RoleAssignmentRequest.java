package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for role assignment/revocation request.
 */
@Data
public class RoleAssignmentRequest {
    
    @NotNull(message = "Role ID is required")
    private UUID roleId;
    
    private String reason;
}
