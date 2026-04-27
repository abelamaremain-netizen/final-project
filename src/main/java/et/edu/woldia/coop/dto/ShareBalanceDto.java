package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for share balance information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareBalanceDto {
    
    private UUID memberId;
    private String memberName;
    private Integer totalShares;
    private BigDecimal currentPricePerShare;
    private BigDecimal totalValue;
    private String currency;
}
