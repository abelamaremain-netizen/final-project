package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for LoanRestructuring entity.
 */
@Data
public class LoanRestructuringDto {
    private UUID id;
    private UUID loanId;
    private UUID memberId;
    private String restructuringReason;
    private Integer newDurationMonths;
    private BigDecimal newInterestRate;
    private String status;
    private LocalDateTime requestDate;
    private String approvedBy;
    private LocalDateTime approvalDate;
    private String denialReason;
}
