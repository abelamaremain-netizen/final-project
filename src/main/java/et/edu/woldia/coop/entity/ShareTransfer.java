package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Share transfer entity representing share transfers between members.
 */
@Entity
@Table(name = "share_transfers")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ShareTransfer extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "from_member_id", nullable = false, columnDefinition = "uuid")
    private UUID fromMemberId;
    
    @Column(name = "to_member_id", nullable = false, columnDefinition = "uuid")
    private UUID toMemberId;
    
    @Column(name = "shares_count", nullable = false)
    private Integer sharesCount;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "price_per_share_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "price_per_share_currency", length = 3))
    })
    private Money pricePerShare;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "total_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "total_currency", length = 3))
    })
    private Money totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status = TransferStatus.PENDING;
    
    @Column(name = "requested_date", nullable = false)
    private LocalDateTime requestedDate;
    
    @Column(name = "approved_date")
    private LocalDateTime approvedDate;
    
    @Column(name = "approved_by")
    private String approvedBy;
    
    @Column(name = "denial_reason", length = 500)
    private String denialReason;
    
    @Column(length = 500)
    private String notes;
    
    public enum TransferStatus {
        PENDING,
        APPROVED,
        DENIED,
        COMPLETED
    }
}
