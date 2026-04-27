package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for financial report.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReportDto {
    
    private LocalDate reportDate;
    private String generatedBy;
    
    // Savings
    private BigDecimal totalRegularSavings;
    private BigDecimal totalNonRegularSavings;
    private BigDecimal totalSavings;
    
    // Share Capital
    private BigDecimal totalShareCapital;
    private int totalShares;
    
    // Loans
    private BigDecimal totalLoansDisbursed;
    private BigDecimal totalOutstandingLoans;
    private BigDecimal totalLoanRepayments;
    private int activeLoanCount;
    
    // Interest
    private BigDecimal totalInterestEarned;
    private BigDecimal totalInterestPaid;
    
    // Liquidity
    private BigDecimal availableLiquidity;
    private BigDecimal liquidityRatio;
    private BigDecimal lendingLimitPercentage;
    private BigDecimal remainingLendingCapacity;
    
    // Compliance
    private boolean withinLendingLimit;
    private String complianceStatus;
}
