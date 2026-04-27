package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for loan restructuring request.
 */
@Data
public class LoanRestructuringRequestDto {
    
    @NotNull(message = "Loan ID is required")
    private UUID loanId;
    
    @NotBlank(message = "Restructuring reason is required")
    @Size(max = 2000, message = "Reason cannot exceed 2000 characters")
    private String restructuringReason;
    
    @NotNull(message = "New duration is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    @Max(value = 60, message = "Duration cannot exceed 60 months")
    private Integer newDurationMonths;
    
    @DecimalMin(value = "0.13", message = "Interest rate must be at least 13%")
    @DecimalMax(value = "0.19", message = "Interest rate cannot exceed 19%")
    private BigDecimal newInterestRate;
}
