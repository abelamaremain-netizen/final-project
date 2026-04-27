package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tracks which configuration version is used for each transaction.
 * 
 * This ensures that transactions maintain their original configuration
 * parameters even if the system configuration changes later.
 */
@Entity
@Table(name = "configuration_locks", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"transaction_type", "transaction_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfigurationLock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "transaction_type", nullable = false, length = 100)
    private String transactionType;
    
    @Column(name = "transaction_id", nullable = false, columnDefinition = "uuid")
    private UUID transactionId;
    
    @Column(name = "configuration_version", nullable = false)
    private Integer configurationVersion;
    
    @Column(name = "locked_date", nullable = false)
    private LocalDateTime lockedDate;
    
    @Column(name = "locked_by", nullable = false)
    private String lockedBy;
    
    @PrePersist
    protected void onCreate() {
        if (lockedDate == null) {
            lockedDate = LocalDateTime.now();
        }
    }
}
