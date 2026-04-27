package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * DTO for reconciliation report.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationReportDto {
    
    private YearMonth month;
    private long expectedDeductions;
    private long confirmedDeductions;
    private long failedDeductions;
    private BigDecimal totalExpected;
    private BigDecimal totalConfirmed;
    private BigDecimal discrepancyAmount;
    private List<DiscrepancyDto> discrepancies;
    private LocalDate reconciliationDate;
    private String reconciledBy;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscrepancyDto {
        private String memberId;
        private String memberName;
        private BigDecimal expectedAmount;
        private BigDecimal confirmedAmount;
        private BigDecimal difference;
        private String reason;
    }
}
