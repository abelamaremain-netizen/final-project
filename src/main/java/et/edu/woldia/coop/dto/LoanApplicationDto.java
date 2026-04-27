package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for LoanApplication entity.
 */
@Data
public class LoanApplicationDto {
    private UUID id;
    private UUID memberId;
    private BigDecimal requestedAmount;
    private Integer loanDurationMonths;
    private String loanPurpose;
    private String purposeDescription;
    private String status;
    private LocalDateTime submissionDate;
    private String reviewedBy;
    private LocalDateTime reviewStartDate;
    private String denialReason;
    private String currency;
}