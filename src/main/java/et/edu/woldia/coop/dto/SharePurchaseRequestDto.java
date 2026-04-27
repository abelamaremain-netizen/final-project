package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for share purchase request.
 */
@Data
public class SharePurchaseRequestDto {
    
    @NotNull(message = "Member ID is required")
    private UUID memberId;
    
    @NotNull(message = "Number of shares is required")
    @Min(value = 1, message = "Must purchase at least 1 share")
    private Integer sharesCount;
    
    private String notes;
}
