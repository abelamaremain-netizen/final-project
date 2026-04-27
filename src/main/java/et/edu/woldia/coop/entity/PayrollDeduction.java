package et.edu.woldia.coop.entity;

import et.edu.woldia.coop.converter.YearMonthConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

@Entity
@Table(name = "payroll_deductions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PayrollDeduction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "member_id", nullable = false, columnDefinition = "uuid")
    private UUID memberId;

    @Convert(converter = YearMonthConverter.class)
    @Column(name = "deduction_month", nullable = false)
    private YearMonth deductionMonth;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "deduction_amount_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "deduction_amount_currency", length = 3))
    })
    private Money deductionAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DeductionStatus status;

    @Column(name = "generated_date")
    private LocalDate generatedDate;

    @Column(name = "confirmed_date")
    private LocalDate confirmedDate;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "confirmed_amount_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "confirmed_amount_currency", length = 3))
    })
    private Money confirmedAmount;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "processed_by")
    private String processedBy;

    public enum DeductionStatus {
        PENDING,
        CONFIRMED,
        PROCESSED,
        FAILED
    }
}