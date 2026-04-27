package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * System configuration entity with versioned parameters.
 * 
 * Configuration parameters are versioned to ensure transactional integrity.
 * When a transaction occurs (e.g., loan approval), the configuration version
 * is locked to that transaction, ensuring historical accuracy.
 */
@Entity
@Table(name = "system_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private Integer version;
    
    @Column(name = "effective_date", nullable = false)
    private LocalDateTime effectiveDate;
    
    // Financial Parameters
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "registration_fee_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "registration_fee_currency", length = 3))
    })
    private Money registrationFee;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "share_price_per_share_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "share_price_per_share_currency", length = 3))
    })
    private Money sharePricePerShare;
    
    @Column(name = "minimum_shares_required", nullable = false)
    private Integer minimumSharesRequired;
    
    @Column(name = "maximum_shares_allowed")
    private Integer maximumSharesAllowed;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "minimum_monthly_deduction_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "minimum_monthly_deduction_currency", length = 3))
    })
    private Money minimumMonthlyDeduction;
    
    @Column(name = "savings_interest_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal savingsInterestRate;
    
    @Column(name = "loan_interest_rate_min", nullable = false, precision = 5, scale = 4)
    private BigDecimal loanInterestRateMin;
    
    @Column(name = "loan_interest_rate_max", nullable = false, precision = 5, scale = 4)
    private BigDecimal loanInterestRateMax;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "maximum_loan_cap_per_member_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "maximum_loan_cap_per_member_currency", length = 3))
    })
    private Money maximumLoanCapPerMember;
    
    @Column(name = "lending_limit_percentage", nullable = false, precision = 5, scale = 4)
    private BigDecimal lendingLimitPercentage;
    
    @Column(name = "fixed_asset_ltv_ratio", nullable = false, precision = 5, scale = 4)
    private BigDecimal fixedAssetLtvRatio;
    
    // Operational Parameters
    @Column(name = "membership_duration_threshold_months", nullable = false)
    private Integer membershipDurationThresholdMonths;
    
    @Column(name = "loan_multiplier_below_threshold", nullable = false, precision = 5, scale = 2)
    private BigDecimal loanMultiplierBelowThreshold;
    
    @Column(name = "loan_multiplier_above_threshold", nullable = false, precision = 5, scale = 2)
    private BigDecimal loanMultiplierAboveThreshold;
    
    @Column(name = "contract_signing_deadline_days", nullable = false)
    private Integer contractSigningDeadlineDays;
    
    @Column(name = "loan_disbursement_deadline_days", nullable = false)
    private Integer loanDisbursementDeadlineDays;
    
    @Column(name = "loan_processing_sla_days", nullable = false)
    private Integer loanProcessingSlaDays;
    
    @Column(name = "delinquency_grace_period_days", nullable = false)
    private Integer delinquencyGracePeriodDays;
    
    @Column(name = "member_withdrawal_processing_days", nullable = false)
    private Integer memberWithdrawalProcessingDays;
    
    @Column(name = "collateral_appraisal_validity_months", nullable = false)
    private Integer collateralAppraisalValidityMonths;
    
    @Column(name = "vehicle_age_limit_years", nullable = false)
    private Integer vehicleAgeLimitYears;
    
    @Column(name = "deduction_decrease_waiting_months", nullable = false)
    private Integer deductionDecreaseWaitingMonths;
    
    @Column(name = "non_regular_savings_withdrawal_days", nullable = false)
    private Integer nonRegularSavingsWithdrawalDays;
    
    // Penalties & Fees
    @Column(name = "late_payment_penalty_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal latePaymentPenaltyRate;
    
    @Column(name = "late_payment_penalty_grace_days", nullable = false)
    private Integer latePaymentPenaltyGraceDays;
    
    @Column(name = "early_loan_repayment_penalty", precision = 5, scale = 4)
    private BigDecimal earlyLoanRepaymentPenalty;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "member_withdrawal_processing_fee_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "member_withdrawal_processing_fee_currency", length = 3))
    })
    private Money memberWithdrawalProcessingFee;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "share_transfer_fee_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "share_transfer_fee_currency", length = 3))
    })
    private Money shareTransferFee;
    
    // Limits & Constraints
    @Column(name = "maximum_active_loans_per_member", nullable = false)
    private Integer maximumActiveLoansPerMember;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "minimum_loan_amount_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "minimum_loan_amount_currency", length = 3))
    })
    private Money minimumLoanAmount;
    
    @Column(name = "max_consecutive_missed_deductions_before_suspension", nullable = false)
    private Integer maxConsecutiveMissedDeductionsBeforeSuspension;
    
    @Column(name = "minimum_membership_duration_before_withdrawal_months", nullable = false)
    private Integer minimumMembershipDurationBeforeWithdrawalMonths;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", nullable = false, updatable = false)
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (effectiveDate == null) {
            effectiveDate = LocalDateTime.now();
        }
    }
}
