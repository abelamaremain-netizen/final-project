package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.UUID;

/**
 * DTO for confirming payroll deductions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeductionConfirmationDto {
    
    @NotNull(message = "Member ID is required")
    private UUID memberId;
    
    @NotNull(message = "Deduction month is required")
    private YearMonth deductionMonth;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private String employerReference;
}
