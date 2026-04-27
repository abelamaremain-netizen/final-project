package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for audit log data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {

    private UUID id;
    private LocalDateTime timestamp;
    private UUID userId;
    private String username;
    private String action;
    private String entityType;
    private UUID entityId;
    private String description;
    private String ipAddress;
    private String status;
    private String errorMessage;
}