package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Loan appeal entity representing appeals to general assembly.
 */
@Entity
@Table(name = "loan_appeals")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoanAppeal extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "application_id", nullable = false, columnDefinition = "uuid")
    private UUID applicationId;
    
    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;
    
    @Column(name = "appeal_reason", length = 2000, nullable = false)
    private String appealReason;
    
    @Column(name = "submitted_date", nullable = false)
    private LocalDateTime submissionDate;

    @jakarta.persistence.PrePersist
    protected void onPrePersist() {
        if (submissionDate == null) {
            submissionDate = LocalDateTime.now();
        }
    }
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppealStatus status = AppealStatus.PENDING;
    
    @Column(name = "assembly_meeting_date")
    private LocalDateTime assemblyMeetingDate;
    
    @Column(name = "decision_date")
    private LocalDateTime decisionDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "decision")
    private AppealDecision decision;
    
    @Column(name = "decision_notes", length = 2000)
    private String decisionNotes;
    
    @Column(name = "recorded_by")
    private String recordedBy;

    @Column(name = "processed_by")
    private String processedBy;
    
    public enum AppealStatus {
        PENDING,
        SCHEDULED,
        DECIDED
    }
    
    public enum AppealDecision {
        APPROVED,
        DENIED,
        DEFERRED
    }
}
