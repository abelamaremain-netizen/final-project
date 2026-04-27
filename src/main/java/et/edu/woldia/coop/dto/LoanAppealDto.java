package et.edu.woldia.coop.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for LoanAppeal entity.
 */
@Data
public class LoanAppealDto {
    private UUID id;
    private UUID applicationId;
    private UUID memberId;
    private String appealReason;
    private String status;
    private LocalDateTime submissionDate;
    private String decision;
    private String decisionNotes;
    private LocalDateTime decisionDate;
    private String decidedBy;
}
