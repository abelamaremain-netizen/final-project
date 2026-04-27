package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Loan restructuring entity representing loan restructuring requests.
 */
@Entity
@Table(name = "loan_restructurings")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoanRestructuring extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "original_loan_id", nullable = false, columnDefinition = "uuid")
    private UUID originalLoanId;
    
    @Column(name = "new_loan_id", columnDefinition = "uuid")
    private UUID newLoanId;
    
    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;
    
    @Column(name = "restructuring_reason", length = 2000, nullable = false)
    private String restructuringReason;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "outstanding_at_restructure_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "outstanding_at_restructure_currency", length = 3))
    })
    private Money outstandingAtRestructure;
    
    @Column(name = "new_duration_months")
    private Integer newDurationMonths;
    
    @Column(name = "new_interest_rate", precision = 5, scale = 4)
    private BigDecimal newInterestRate;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "new_monthly_payment_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "currency", length = 3))
    })
    private Money newMonthlyPayment;
    
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;
    
    @Column(name = "requested_by", nullable = false)
    private String requestedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestructuringStatus status = RestructuringStatus.PENDING;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Column(name = "approved_by")
    private String approvedBy;
    
    @Column(name = "denial_reason", length = 1000)
    private String denialReason;
    
    @Column(name = "config_version")
    private Integer configVersion;
    
    public enum RestructuringStatus {
        PENDING,
        APPROVED,
        DENIED,
        COMPLETED
    }
}
