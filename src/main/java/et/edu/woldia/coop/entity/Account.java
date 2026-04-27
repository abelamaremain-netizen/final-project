package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Account entity representing member savings accounts.
 * 
 * Two types: Regular Saving (no withdrawals) and Non-Regular Saving (flexible).
 */
@Entity
@Table(name = "accounts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Account extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "balance_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "balance_currency", length = 3, nullable = false))
    })
    private Money balance = new Money(BigDecimal.ZERO, "ETB");
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "pledged_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "pledged_currency", length = 3, nullable = false))
    })
    private Money pledgedAmount = new Money(BigDecimal.ZERO, "ETB");
    
    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal interestRate;
    
    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;
    
    @Column(name = "last_interest_date")
    private LocalDate lastInterestDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status = AccountStatus.ACTIVE;
    
    public enum AccountType {
        REGULAR_SAVING,
        NON_REGULAR_SAVING
    }
    
    public enum AccountStatus {
        ACTIVE,
        FROZEN,
        CLOSED
    }
    
    /**
     * Get available balance (balance - pledged amount)
     */
    public Money getAvailableBalance() {
        String currency = balance.getCurrency() != null ? balance.getCurrency() : "ETB";
        return new Money(
            balance.getAmount().subtract(pledgedAmount.getAmount()),
            currency
        );
    }
    
    /**
     * Check if account has sufficient available balance
     */
    public boolean hasSufficientBalance(Money amount) {
        return getAvailableBalance().getAmount().compareTo(amount.getAmount()) >= 0;
    }
}
