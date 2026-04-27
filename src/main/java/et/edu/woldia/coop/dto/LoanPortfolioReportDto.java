package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for loan portfolio report.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanPortfolioReportDto {
    
    private LocalDate reportDate;
    private String generatedBy;
    
    // Overall statistics
    private int totalLoans;
    private int activeLoans;
    private int completedLoans;
    private int defaultedLoans;
    
    // Financial metrics
    private BigDecimal totalDisbursed;
    private BigDecimal totalOutstanding;
    private BigDecimal totalRepaid;
    private BigDecimal averageLoanAmount;
    private BigDecimal averageInterestRate;
    
    // Loan duration statistics
    private Map<String, Integer> loansByDuration;  // "12-24 months" -> count
    private Map<String, BigDecimal> outstandingByDuration;
    
    // Loan status distribution
    private Map<String, Integer> loansByStatus;
    private Map<String, BigDecimal> outstandingByStatus;
    
    // Performance metrics
    private BigDecimal repaymentRate;  // percentage
    private BigDecimal defaultRate;  // percentage
    private int delinquentLoans;
    private BigDecimal delinquentAmount;
}
