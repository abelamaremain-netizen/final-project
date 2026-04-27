package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Loan entity representing an approved and disbursed loan.
 */
@Entity
@Table(name = "loans")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Loan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "application_id", nullable = false, columnDefinition = "uuid")
    private UUID applicationId;

    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "principal_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "principal_currency", length = 3))
    })
    private Money principalAmount;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal interestRate;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "outstanding_principal_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "outstanding_principal_currency", length = 3))
    })
    private Money outstandingPrincipal;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "outstanding_interest_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "outstanding_interest_currency", length = 3))
    })
    private Money outstandingInterest;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "total_paid_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "total_paid_currency", length = 3))
    })
    private Money totalPaid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status = LoanStatus.APPROVED;

    @Column(name = "approval_date", nullable = false)
    private LocalDateTime approvalDate;

    @Column(name = "disbursement_date")
    private LocalDate disbursementDate;

    @Column(name = "first_payment_date")
    private LocalDate firstPaymentDate;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    @Column(name = "last_payment_date")
    private LocalDate lastPaymentDate;

    @Column(name = "config_version", nullable = false)
    private Integer configVersion;

    public enum LoanStatus {
        APPROVED,
        CONTRACT_PENDING,
        DISBURSED,
        ACTIVE,
        PAID_OFF,
        DEFAULTED,
        RESTRUCTURED
    }
}