package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for loan appeal request.
 */
@Data
public class LoanAppealRequestDto {
    
    @NotNull(message = "Application ID is required")
    private UUID applicationId;
    
    @NotBlank(message = "Appeal reason is required")
    @Size(max = 2000, message = "Appeal reason cannot exceed 2000 characters")
    private String appealReason;
}
