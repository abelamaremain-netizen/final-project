package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO for deduction change request.
 */
@Data
public class DeductionChangeRequestDto {
    
    @NotNull(message = "New deduction amount is required")
    @DecimalMin(value = "0.0", message = "Deduction amount must be positive")
    private BigDecimal newDeductionAmount;
    
    private String reason;
}
