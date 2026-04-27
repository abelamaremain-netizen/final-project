package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Transaction entity.
 */
@Data
public class TransactionDto {
    
    private UUID id;
    private UUID accountId;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private LocalDateTime timestamp;
    private String source;
    private String reference;
    private String processedBy;
    private String notes;
}
