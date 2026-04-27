package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for Loan entity.
 */
@Data
public class LoanDto {
    private UUID id;
    private UUID memberId;
    private UUID applicationId;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer durationMonths;
    private BigDecimal outstandingPrincipal;
    private BigDecimal outstandingInterest;
    private LocalDate disbursementDate;
    private LocalDate maturityDate;
    private String status;
    private String approvedBy;
    private LocalDate approvalDate;
    private String disbursedBy;
    private Integer configVersion;
    private String currency;
}
