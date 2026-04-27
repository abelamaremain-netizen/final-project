package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Loan default entity representing defaulted loans.
 */
@Entity
@Table(name = "loan_defaults")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoanDefault extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "loan_id", nullable = false, unique = true, columnDefinition = "uuid")
    private UUID loanId;
    
    @Column(name = "default_date", nullable = false)
    private LocalDateTime defaultDate;
    
    @Column(name = "declared_by", nullable = false)
    private String declaredBy;
    
    @Column(name = "days_overdue_at_default", nullable = false)
    private Integer daysOverdueAtDefault;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "outstanding_at_default_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "outstanding_at_default_currency", length = 3))
    })
    private Money outstandingAtDefault;
    
    @Column(name = "default_reason", length = 1000)
    private String defaultReason;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DefaultStatus status = DefaultStatus.DECLARED;
    
    @Column(name = "legal_action_initiated")
    private Boolean legalActionInitiated = false;
    
    @Column(name = "legal_action_date")
    private LocalDateTime legalActionDate;
    
    @Column(name = "court_case_number")
    private String courtCaseNumber;
    
    @Column(name = "resolution_date")
    private LocalDateTime resolutionDate;
    
    @Column(name = "resolution_notes", length = 1000)
    private String resolutionNotes;
    
    public enum DefaultStatus {
        DECLARED,
        LEGAL_ACTION_INITIATED,
        IN_COURT,
        RESOLVED,
        WRITTEN_OFF
    }
}
