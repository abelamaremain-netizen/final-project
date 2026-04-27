package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for MemberSuspension entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberSuspensionDto {
    
    private UUID id;
    private UUID memberId;
    private String memberName;
    private LocalDateTime suspendedDate;
    private String reason;
    private String suspendedBy;
    private LocalDateTime reactivatedDate;
    private String reactivatedBy;
    private boolean isActive;
}
