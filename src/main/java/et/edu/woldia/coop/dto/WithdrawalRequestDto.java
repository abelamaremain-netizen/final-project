package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for member withdrawal request.
 */
@Data
public class WithdrawalRequestDto {    private LocalDate withdrawalDate;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private String notes;
}
