package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for withdrawal payout calculation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalPayoutDto {
    
    private UUID memberId;
    private String memberName;
    
    // Account balances
    private BigDecimal regularSavingBalance;
    private BigDecimal nonRegularSavingBalance;
    private BigDecimal totalSavings;
    
    // Share capital
    private Integer shareCount;
    private BigDecimal sharePrice;
    private BigDecimal shareValue;
    
    // Interest
    private BigDecimal accruedInterest;
    
    // Deductions
    private BigDecimal outstandingLoans;
    private BigDecimal processingFees;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;
    
    // Final payout
    private BigDecimal grossPayout;
    private BigDecimal netPayout;
    
    private String currency;
}
