package et.edu.woldia.coop.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserAdminEventDto {
    private UUID id;
    private UUID userId;
    private String username;
    private String eventType;
    private String performedBy;
    private LocalDateTime performedAt;
    private String description;
}
