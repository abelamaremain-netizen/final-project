package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit trail for role assignments and revocations.
 * 
 * Tracks all role grant and revoke operations for compliance.
 */
@Entity
@Table(name = "role_assignment_audit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignmentAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;
    
    @Column(name = "role_id", nullable = false, columnDefinition = "uuid")
    private UUID roleId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Action action;
    
    @Column(name = "performed_by", nullable = false)
    private String performedBy;
    
    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    public enum Action {
        grant,
        revoke
    }
    
    @PrePersist
    protected void onCreate() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
    }
}
