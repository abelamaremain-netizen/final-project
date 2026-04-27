package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for ShareTransfer entity.
 */
@Data
public class ShareTransferDto {
    private UUID id;
    private UUID fromMemberId;
    private UUID toMemberId;
    private Integer sharesCount;
    private BigDecimal pricePerShare;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime initiatedDate;
    private String approvedBy;
    private LocalDateTime approvalDate;
    private String denialReason;
    private String notes;
    private String currency;
}
