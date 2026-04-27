package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Loan application entity.
 */
@Entity
@Table(name = "loan_applications")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "requested_amount_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "requested_currency", length = 3))
    })
    private Money requestedAmount;

    @Column(name = "loan_duration_months", nullable = false)
    private Integer loanDurationMonths;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_purpose", nullable = false)
    private LoanPurpose loanPurpose;

    @Column(name = "purpose_description", length = 1000)
    private String purposeDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;

    @Column(name = "queue_position")
    private Integer queuePosition;

    @Column(name = "review_started_date")
    private LocalDateTime reviewStartedDate;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "denial_reason", length = 1000)
    private String denialReason;

    @Column(name = "config_version")
    private Integer configVersion;

    public enum LoanPurpose {
        BUSINESS,
        EDUCATION,
        MEDICAL,
        HOUSING,
        VEHICLE,
        EMERGENCY,
        OTHER
    }

    public enum ApplicationStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        DENIED,
        WITHDRAWN,
        EXPIRED
    }
}