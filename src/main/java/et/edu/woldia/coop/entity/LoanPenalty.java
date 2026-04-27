package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Loan penalty entity representing penalties assessed on loans.
 */
@Entity
@Table(name = "loan_penalties")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LoanPenalty extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "loan_id", nullable = false, columnDefinition = "uuid")
    private UUID loanId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "penalty_type", nullable = false)
    private PenaltyType penaltyType;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "penalty_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "penalty_currency", length = 3))
    })
    private Money penaltyAmount;
    
    @Column(name = "penalty_rate", precision = 5, scale = 4)
    private BigDecimal penaltyRate;
    
    @Column(name = "days_overdue")
    private Integer daysOverdue;
    
    @Column(name = "assessment_date", nullable = false)
    private LocalDate assessmentDate;
    
    @Column(name = "assessed_by", nullable = false)
    private String assessedBy;
    
    @Column(name = "config_version", nullable = false)
    private Integer configVersion;
    
    @Column(name = "is_paid")
    private Boolean isPaid = false;
    
    @Column(name = "paid_date")
    private LocalDate paidDate;
    
    @Column(length = 500)
    private String notes;
    
    public enum PenaltyType {
        LATE_PAYMENT,
        MISSED_PAYMENT,
        DEFAULT
    }
}
