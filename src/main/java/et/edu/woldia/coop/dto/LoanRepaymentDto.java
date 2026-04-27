package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for LoanRepayment entity.
 */
@Data
public class LoanRepaymentDto {
    private UUID id;
    private UUID loanId;
    private BigDecimal paymentAmount;
    private BigDecimal principalPaid;
    private BigDecimal interestPaid;
    private BigDecimal penaltyPaid;
    private LocalDate paymentDate;
    private String processedBy;
    private String notes;
    private String currency;
}
