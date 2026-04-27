package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for member passbook.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassbookDto {
    
    private UUID memberId;
    private String memberName;
    private String nationalId;
    private LocalDate registrationDate;
    private LocalDate generatedDate;
    
    // Account balances
    private BigDecimal regularSavingsBalance;
    private BigDecimal nonRegularSavingsBalance;
    private BigDecimal totalSavings;
    
    // Share capital
    private int shareCount;
    private BigDecimal shareValue;
    
    // Pledged amounts
    private BigDecimal pledgedAmount;
    private BigDecimal availableBalance;
    
    // Transactions
    private List<PassbookTransactionDto> regularSavingsTransactions;
    private List<PassbookTransactionDto> nonRegularSavingsTransactions;
    private List<PassbookLoanDto> loans;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassbookTransactionDto {
        private LocalDate date;
        private String type;
        private String description;
        private BigDecimal amount;
        private BigDecimal balance;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassbookLoanDto {
        private UUID loanId;
        private LocalDate disbursementDate;
        private BigDecimal principal;
        private BigDecimal interestRate;
        private int duration;
        private BigDecimal outstandingBalance;
        private String status;
        private List<PassbookRepaymentDto> repayments;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassbookRepaymentDto {
        private LocalDate date;
        private BigDecimal amount;
        private BigDecimal principalPortion;
        private BigDecimal interestPortion;
        private BigDecimal outstandingAfter;
    }
}
