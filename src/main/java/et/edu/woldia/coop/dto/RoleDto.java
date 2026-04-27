package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for Role entity.
 */
@Data
public class RoleDto {
    
    private String id;
    
    @NotBlank(message = "Role name is required")
    private String name;
    
    private String description;
    private Set<String> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
