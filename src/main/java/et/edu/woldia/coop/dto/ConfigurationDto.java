package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * DTO for system configuration.
 */
@Data
public class ConfigurationDto {
    
    private UUID id;
    private Integer version;
    // Accepts both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" from frontend
    private String effectiveDate;
    
    // Financial Parameters
    @NotNull(message = "Registration fee is required")
    @DecimalMin(value = "0.0", message = "Registration fee must be positive")
    private BigDecimal registrationFee;
    
    @NotNull(message = "Share price is required")
    @DecimalMin(value = "0.0", message = "Share price must be positive")
    private BigDecimal sharePricePerShare;
    
    @NotNull(message = "Minimum shares required is required")
    @Min(value = 0, message = "Minimum shares must be positive")
    private Integer minimumSharesRequired;
    
    private Integer maximumSharesAllowed;
    
    @NotNull(message = "Minimum monthly deduction is required")
    @DecimalMin(value = "0.0", message = "Minimum monthly deduction must be positive")
    private BigDecimal minimumMonthlyDeduction;
    
    @NotNull(message = "Savings interest rate is required")
    @DecimalMin(value = "0.0", message = "Savings interest rate must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Savings interest rate must be between 0 and 1")
    private BigDecimal savingsInterestRate;
    
    @NotNull(message = "Loan interest rate min is required")
    @DecimalMin(value = "0.0", message = "Loan interest rate min must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Loan interest rate min must be between 0 and 1")
    private BigDecimal loanInterestRateMin;
    
    @NotNull(message = "Loan interest rate max is required")
    @DecimalMin(value = "0.0", message = "Loan interest rate max must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Loan interest rate max must be between 0 and 1")
    private BigDecimal loanInterestRateMax;
    
    @NotNull(message = "Maximum loan cap is required")
    @DecimalMin(value = "0.0", message = "Maximum loan cap must be positive")
    private BigDecimal maximumLoanCapPerMember;
    
    @NotNull(message = "Lending limit percentage is required")
    @DecimalMin(value = "0.0", message = "Lending limit percentage must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Lending limit percentage must be between 0 and 1")
    private BigDecimal lendingLimitPercentage;
    
    @NotNull(message = "Fixed asset LTV ratio is required")
    @DecimalMin(value = "0.0", message = "Fixed asset LTV ratio must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Fixed asset LTV ratio must be between 0 and 1")
    private BigDecimal fixedAssetLtvRatio;
    
    // Operational Parameters
    @NotNull(message = "Membership duration threshold is required")
    @Min(value = 0, message = "Membership duration threshold must be positive")
    private Integer membershipDurationThresholdMonths;
    
    @NotNull(message = "Loan multiplier below threshold is required")
    @DecimalMin(value = "0.0", message = "Loan multiplier below threshold must be positive")
    private BigDecimal loanMultiplierBelowThreshold;
    
    @NotNull(message = "Loan multiplier above threshold is required")
    @DecimalMin(value = "0.0", message = "Loan multiplier above threshold must be positive")
    private BigDecimal loanMultiplierAboveThreshold;
    
    @NotNull(message = "Contract signing deadline is required")
    @Min(value = 1, message = "Contract signing deadline must be at least 1 day")
    private Integer contractSigningDeadlineDays;
    
    @NotNull(message = "Loan disbursement deadline is required")
    @Min(value = 1, message = "Loan disbursement deadline must be at least 1 day")
    private Integer loanDisbursementDeadlineDays;
    
    @NotNull(message = "Loan processing SLA is required")
    @Min(value = 1, message = "Loan processing SLA must be at least 1 day")
    private Integer loanProcessingSlaDays;
    
    @NotNull(message = "Delinquency grace period is required")
    @Min(value = 0, message = "Delinquency grace period must be positive")
    private Integer delinquencyGracePeriodDays;
    
    @NotNull(message = "Member withdrawal processing days is required")
    @Min(value = 1, message = "Member withdrawal processing must be at least 1 day")
    private Integer memberWithdrawalProcessingDays;
    
    @NotNull(message = "Collateral appraisal validity is required")
    @Min(value = 1, message = "Collateral appraisal validity must be at least 1 month")
    private Integer collateralAppraisalValidityMonths;
    
    @NotNull(message = "Vehicle age limit is required")
    @Min(value = 1, message = "Vehicle age limit must be at least 1 year")
    private Integer vehicleAgeLimitYears;
    
    @NotNull(message = "Deduction decrease waiting period is required")
    @Min(value = 0, message = "Deduction decrease waiting period must be positive")
    private Integer deductionDecreaseWaitingMonths;
    
    @NotNull(message = "Non-regular savings withdrawal days is required")
    @Min(value = 0, message = "Non-regular savings withdrawal days must be positive")
    private Integer nonRegularSavingsWithdrawalDays;
    
    // Penalties & Fees
    @NotNull(message = "Late payment penalty rate is required")
    @DecimalMin(value = "0.0", message = "Late payment penalty rate must be positive")
    private BigDecimal latePaymentPenaltyRate;
    
    @NotNull(message = "Late payment penalty grace days is required")
    @Min(value = 0, message = "Late payment penalty grace days must be positive")
    private Integer latePaymentPenaltyGraceDays;
    
    private BigDecimal earlyLoanRepaymentPenalty;
    private BigDecimal memberWithdrawalProcessingFee;
    private BigDecimal shareTransferFee;
    
    // Limits & Constraints
    @NotNull(message = "Maximum active loans per member is required")
    @Min(value = 1, message = "Maximum active loans per member must be at least 1")
    private Integer maximumActiveLoansPerMember;
    
    @NotNull(message = "Minimum loan amount is required")
    @DecimalMin(value = "0.0", message = "Minimum loan amount must be positive")
    private BigDecimal minimumLoanAmount;
    
    @NotNull(message = "Max consecutive missed deductions is required")
    @Min(value = 1, message = "Max consecutive missed deductions must be at least 1")
    private Integer maxConsecutiveMissedDeductionsBeforeSuspension;
    
    @NotNull(message = "Minimum membership duration before withdrawal is required")
    @Min(value = 0, message = "Minimum membership duration must be positive")
    private Integer minimumMembershipDurationBeforeWithdrawalMonths;
    
    private LocalDateTime createdAt;
    private String createdBy;

    /**
     * Parse effectiveDate string — accepts "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
     */
    public LocalDateTime getEffectiveDateAsLocalDateTime() {
        if (effectiveDate == null || effectiveDate.isBlank()) return null;
        if (effectiveDate.length() == 10) {
            return LocalDateTime.parse(effectiveDate + "T00:00:00");
        }
        return LocalDateTime.parse(effectiveDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
