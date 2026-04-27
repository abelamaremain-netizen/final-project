package et.edu.woldia.coop.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for LoanDefault entity.
 */
@Data
public class LoanDefaultDto {
    private UUID id;
    private UUID loanId;
    private String status;
    private LocalDateTime defaultDate;
    private String defaultReason;
    private String courtCaseNumber;
    private LocalDateTime legalActionDate;
    private LocalDateTime resolutionDate;
    private String resolutionNotes;
    private String declaredBy;
}
