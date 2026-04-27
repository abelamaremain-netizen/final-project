package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for LoanPenalty entity.
 */
@Data
public class LoanPenaltyDto {
    private UUID id;
    private UUID loanId;
    private BigDecimal penaltyAmount;
    private String penaltyType;
    private LocalDate assessmentDate;
    private String assessedBy;
    private Boolean paid;
    private LocalDate paidDate;
    private String currency;
}
