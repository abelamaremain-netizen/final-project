package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for share transfer request.
 */
@Data
public class ShareTransferRequestDto {
    
    @NotNull(message = "From member ID is required")
    private UUID fromMemberId;
    
    @NotNull(message = "To member ID is required")
    private UUID toMemberId;
    
    @NotNull(message = "Number of shares is required")
    @Min(value = 1, message = "Must transfer at least 1 share")
    private Integer sharesCount;
    
    private String notes;
}
