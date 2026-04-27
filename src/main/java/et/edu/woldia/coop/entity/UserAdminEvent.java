package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit trail for all user administration events.
 * Covers account creation, activation, deactivation, password changes, and profile updates.
 * Accessible to ADMINISTRATOR only — not visible in the general audit log.
 */
@Entity
@Table(name = "user_admin_events", indexes = {
    @Index(name = "idx_user_admin_user_id", columnList = "user_id"),
    @Index(name = "idx_user_admin_performed_at", columnList = "performed_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private EventType eventType;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    public enum EventType {
        CREATE_USER,
        ACTIVATE,
        DEACTIVATE,
        PASSWORD_CHANGE,
        UPDATE_PROFILE
    }

    @PrePersist
    protected void onCreate() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
    }
}
