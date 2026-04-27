package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

/**
 * DTO for payroll deduction data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollDeductionDto {

    private UUID id;
    private UUID memberId;
    private String memberName;
    private YearMonth deductionMonth;
    private BigDecimal deductionAmount;
    private String status;
    private LocalDate generatedDate;
    private LocalDate confirmedDate;
    private BigDecimal confirmedAmount;
    private String failureReason;
    private String processedBy;
}