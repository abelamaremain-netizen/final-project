package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for loan application request.
 */
@Data
public class LoanApplicationRequestDto {

    @NotNull(message = "Member ID is required")
    private UUID memberId;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal requestedAmount;

    @NotNull(message = "Loan duration is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    @Max(value = 60, message = "Duration cannot exceed 60 months")
    private Integer loanDurationMonths;

    @NotBlank(message = "Loan purpose is required")
    private String loanPurpose;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String purposeDescription;
}