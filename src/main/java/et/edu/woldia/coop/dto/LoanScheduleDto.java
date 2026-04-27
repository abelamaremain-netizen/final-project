package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing the full amortization schedule for a loan.
 * Uses simple interest: Interest = Principal × Rate × (months/12)
 */
@Data
public class LoanScheduleDto {
    private UUID loanId;
    private BigDecimal principalAmount;
    private BigDecimal totalInterest;
    private BigDecimal totalPayable;
    private BigDecimal monthlyInstallment;
    private Integer durationMonths;
    private LocalDate disbursementDate;
    private LocalDate maturityDate;
    private String currency;
    private List<LoanScheduleEntryDto> entries;
}
