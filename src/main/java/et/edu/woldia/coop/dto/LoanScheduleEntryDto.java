package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO representing a single installment entry in a loan amortization schedule.
 */
@Data
public class LoanScheduleEntryDto {
    private Integer installmentNumber;
    private LocalDate dueDate;
    private BigDecimal scheduledPayment;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal remainingPrincipal;
    private BigDecimal remainingInterest;
    /** PAID, PARTIAL, PENDING, OVERDUE */
    private String status;
}
