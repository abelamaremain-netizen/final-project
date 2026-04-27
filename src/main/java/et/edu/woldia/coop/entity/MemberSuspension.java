package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Member suspension history record.
 */
@Entity
@Table(name = "member_suspensions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberSuspension {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, columnDefinition = "uuid")
    private Member member;
    
    @Column(name = "suspended_date", nullable = false)
    private LocalDateTime suspendedDate;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "suspended_by", nullable = false)
    private String suspendedBy;
    
    @Column(name = "reactivated_date")
    private LocalDateTime reactivatedDate;
    
    @Column(name = "reactivated_by")
    private String reactivatedBy;
    
    @PrePersist
    protected void onCreate() {
        if (suspendedDate == null) {
            suspendedDate = LocalDateTime.now();
        }
    }
}
