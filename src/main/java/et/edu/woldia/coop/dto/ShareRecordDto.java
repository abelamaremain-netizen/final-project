package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for ShareRecord entity.
 */
@Data
public class ShareRecordDto {
    private UUID id;
    private UUID memberId;
    private Integer sharesPurchased;
    private BigDecimal pricePerShare;
    private BigDecimal totalAmount;
    private LocalDate purchaseDate;
    private String processedBy;
    private String notes;
    private String currency;
}
