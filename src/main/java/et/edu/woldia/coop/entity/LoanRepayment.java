package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Loan repayment entity representing a payment made towards a loan.
 */
@Entity
@Table(name = "loan_repayments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "loan_id", nullable = false, columnDefinition = "uuid")
    private UUID loanId;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "payment_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "payment_currency", length = 3))
    })
    private Money paymentAmount;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "principal_paid_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "principal_paid_currency", length = 3))
    })
    private Money principalPaid;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "interest_paid_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "interest_paid_currency", length = 3))
    })
    private Money interestPaid;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "penalty_paid_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "penalty_paid_currency", length = 3))
    })
    private Money penaltyPaid;
    
    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;
    
    @Column(name = "processed_by", nullable = false)
    private String processedBy;
    
    @Column(length = 500)
    private String notes;

    // Legacy columns from original schema — kept NOT NULL in DB, populated to avoid constraint violations
    @Column(name = "amount_amount")
    private java.math.BigDecimal amountAmount;

    @Column(name = "principal_portion_amount")
    private java.math.BigDecimal principalPortionAmount;

    @Column(name = "interest_portion_amount")
    private java.math.BigDecimal interestPortionAmount;

    @Column(name = "outstanding_balance_after_amount")
    private java.math.BigDecimal outstandingBalanceAfterAmount;
}
