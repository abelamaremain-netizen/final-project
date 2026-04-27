package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Transaction entity representing account transactions.
 */
@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "account_id", nullable = false, columnDefinition = "uuid")
    private UUID accountId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "amount_amount", nullable = false)),
        @AttributeOverride(name = "currency", column = @Column(name = "amount_currency", nullable = false, length = 3))
    })
    private Money amount;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "balance_before_amount", nullable = false)),
        @AttributeOverride(name = "currency", column = @Column(name = "balance_before_currency", nullable = false, length = 3))
    })
    private Money balanceBefore;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "balance_after_amount", nullable = false)),
        @AttributeOverride(name = "currency", column = @Column(name = "balance_after_currency", nullable = false, length = 3))
    })
    private Money balanceAfter;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(length = 100)
    private String source;
    
    @Column(length = 255)
    private String reference;
    
    @Column(name = "processed_by", nullable = false)
    private String processedBy;
    
    @Column(length = 500)
    private String notes;
    
    public enum TransactionType {
        DEPOSIT,
        WITHDRAWAL,
        INTEREST_CREDIT,
        PLEDGE,
        RELEASE,
        TRANSFER_IN,
        TRANSFER_OUT,
        FEE_DEDUCTION
    }
}
