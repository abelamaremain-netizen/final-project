package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Share record entity representing share purchases by members.
 */
@Entity
@Table(name = "share_records")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ShareRecord extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;
    
    @Column(name = "shares_purchased", nullable = false)
    private Integer sharesPurchased;
    
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
    
    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;
    
    @Column(name = "config_version", nullable = false)
    private Integer configVersion;
    
    @Column(name = "processed_by", nullable = false)
    private String processedBy;
    
    @Column(length = 500)
    private String notes;
}
