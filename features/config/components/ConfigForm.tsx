'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircularProgress, Alert } from '@mui/material';
import { useCreateConfigMutation } from '../configApi';

const pos = z.number().positive('Must be positive');
const posInt = z.number().int().positive('Must be positive');
const pct = z.number().min(0.01).max(100, 'Enter as percentage (e.g. 12 for 12%)');
const nonNegInt = z.number().int().min(0, 'Must be 0 or more');

const schema = z.object({
  // Financial
  registrationFee: pos,
  sharePricePerShare: pos,
  minimumSharesRequired: posInt,
  maximumSharesAllowed: posInt.optional(),
  minimumMonthlyDeduction: pos,
  savingsInterestRate: pct,
  loanInterestRateMin: pct,
  loanInterestRateMax: pct,
  maximumLoanCapPerMember: pos,
  lendingLimitPercentage: pct,
  fixedAssetLtvRatio: pct,
  minimumLoanAmount: pos,
  // Operational
  membershipDurationThresholdMonths: posInt,
  loanMultiplierBelowThreshold: pos,
  loanMultiplierAboveThreshold: pos,
  contractSigningDeadlineDays: posInt,
  loanDisbursementDeadlineDays: posInt,
  loanProcessingSlaDays: posInt,
  delinquencyGracePeriodDays: nonNegInt,
  memberWithdrawalProcessingDays: posInt,
  collateralAppraisalValidityMonths: posInt,
  vehicleAgeLimitYears: posInt,
  deductionDecreaseWaitingMonths: nonNegInt,
  nonRegularSavingsWithdrawalDays: nonNegInt,
  // Penalties
  latePaymentPenaltyRate: pct,
  latePaymentPenaltyGraceDays: nonNegInt,
  earlyLoanRepaymentPenalty: z.number().min(0).optional(),
  memberWithdrawalProcessingFee: z.number().min(0).optional(),
  shareTransferFee: z.number().min(0).optional(),
  // Limits
  maximumActiveLoansPerMember: posInt,
  maxConsecutiveMissedDeductionsBeforeSuspension: posInt,
  minimumMembershipDurationBeforeWithdrawalMonths: nonNegInt,
  // Effective date
  effectiveDate: z.string().min(1, 'Required'),
}).refine(d => d.loanInterestRateMin <= d.loanInterestRateMax, {
  message: 'Min rate cannot exceed max rate',
  path: ['loanInterestRateMax'],
});

type FormData = z.infer<typeof schema>;

interface Props { onSuccess?: () => void; }

const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/60 border border-white/40 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
const errCls = 'text-xs text-red-500 mt-1';

function F({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {err && <p className={errCls}>{err}</p>}
    </div>
  );
}

export function ConfigForm({ onSuccess }: Props) {
  const [createConfig, { isLoading, isSuccess, error }] = useCreateConfigMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      savingsInterestRate: 5, loanInterestRateMin: 10, loanInterestRateMax: 15,
      lendingLimitPercentage: 80, fixedAssetLtvRatio: 70, latePaymentPenaltyRate: 2,
      membershipDurationThresholdMonths: 12, contractSigningDeadlineDays: 7,
      loanDisbursementDeadlineDays: 14, loanProcessingSlaDays: 30,
      delinquencyGracePeriodDays: 30, memberWithdrawalProcessingDays: 30,
      collateralAppraisalValidityMonths: 12, vehicleAgeLimitYears: 10,
      deductionDecreaseWaitingMonths: 6, nonRegularSavingsWithdrawalDays: 7,
      latePaymentPenaltyGraceDays: 7, maximumActiveLoansPerMember: 2,
      maxConsecutiveMissedDeductionsBeforeSuspension: 3,
      minimumMembershipDurationBeforeWithdrawalMonths: 6,
      loanMultiplierBelowThreshold: 3, loanMultiplierAboveThreshold: 5,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createConfig({
        registrationFee: data.registrationFee,
        sharePricePerShare: data.sharePricePerShare,
        minimumSharesRequired: data.minimumSharesRequired,
        maximumSharesAllowed: data.maximumSharesAllowed,
        minimumMonthlyDeduction: data.minimumMonthlyDeduction,
        savingsInterestRate: data.savingsInterestRate / 100,
        loanInterestRateMin: data.loanInterestRateMin / 100,
        loanInterestRateMax: data.loanInterestRateMax / 100,
        maximumLoanCapPerMember: data.maximumLoanCapPerMember,
        lendingLimitPercentage: data.lendingLimitPercentage / 100,
        fixedAssetLtvRatio: data.fixedAssetLtvRatio / 100,
        minimumLoanAmount: data.minimumLoanAmount,
        membershipDurationThresholdMonths: data.membershipDurationThresholdMonths,
        loanMultiplierBelowThreshold: data.loanMultiplierBelowThreshold,
        loanMultiplierAboveThreshold: data.loanMultiplierAboveThreshold,
        contractSigningDeadlineDays: data.contractSigningDeadlineDays,
        loanDisbursementDeadlineDays: data.loanDisbursementDeadlineDays,
        loanProcessingSlaDays: data.loanProcessingSlaDays,
        delinquencyGracePeriodDays: data.delinquencyGracePeriodDays,
        memberWithdrawalProcessingDays: data.memberWithdrawalProcessingDays,
        collateralAppraisalValidityMonths: data.collateralAppraisalValidityMonths,
        vehicleAgeLimitYears: data.vehicleAgeLimitYears,
        deductionDecreaseWaitingMonths: data.deductionDecreaseWaitingMonths,
        nonRegularSavingsWithdrawalDays: data.nonRegularSavingsWithdrawalDays,
        latePaymentPenaltyRate: data.latePaymentPenaltyRate / 100,
        latePaymentPenaltyGraceDays: data.latePaymentPenaltyGraceDays,
        earlyLoanRepaymentPenalty: data.earlyLoanRepaymentPenalty != null ? data.earlyLoanRepaymentPenalty / 100 : undefined,
        memberWithdrawalProcessingFee: data.memberWithdrawalProcessingFee,
        shareTransferFee: data.shareTransferFee,
        maximumActiveLoansPerMember: data.maximumActiveLoansPerMember,
        maxConsecutiveMissedDeductionsBeforeSuspension: data.maxConsecutiveMissedDeductionsBeforeSuspension,
        minimumMembershipDurationBeforeWithdrawalMonths: data.minimumMembershipDurationBeforeWithdrawalMonths,
        effectiveDate: data.effectiveDate,
      }).unwrap();
      reset();
      onSuccess?.();
    } catch {}
  };

  const errMsg = error && typeof error === 'object' && 'data' in error
    ? (error.data as any)?.message
    : 'Failed to save configuration';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSuccess && <Alert severity="success" className="rounded-xl">Configuration saved successfully.</Alert>}
      {Boolean(error) && <Alert severity="error" className="rounded-xl">{errMsg}</Alert>}

      {/* Financial Parameters */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Financial Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <F label="Registration Fee (ETB)" err={errors.registrationFee?.message}>
            <input type="number" step="0.01" {...register('registrationFee', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Share Price Per Share (ETB)" err={errors.sharePricePerShare?.message}>
            <input type="number" step="0.01" {...register('sharePricePerShare', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Min. Shares Required" err={errors.minimumSharesRequired?.message}>
            <input type="number" {...register('minimumSharesRequired', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Max. Shares Allowed" err={errors.maximumSharesAllowed?.message}>
            <input type="number" {...register('maximumSharesAllowed', { valueAsNumber: true })} className={inputCls} placeholder="Optional" />
          </F>
          <F label="Min. Monthly Deduction (ETB)" err={errors.minimumMonthlyDeduction?.message}>
            <input type="number" step="0.01" {...register('minimumMonthlyDeduction', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Savings Interest Rate (%)" err={errors.savingsInterestRate?.message}>
            <input type="number" step="0.01" {...register('savingsInterestRate', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Loan Rate Min (%)" err={errors.loanInterestRateMin?.message}>
            <input type="number" step="0.01" {...register('loanInterestRateMin', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Loan Rate Max (%)" err={errors.loanInterestRateMax?.message}>
            <input type="number" step="0.01" {...register('loanInterestRateMax', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Max Loan Cap Per Member (ETB)" err={errors.maximumLoanCapPerMember?.message}>
            <input type="number" step="0.01" {...register('maximumLoanCapPerMember', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Min. Loan Amount (ETB)" err={errors.minimumLoanAmount?.message}>
            <input type="number" step="0.01" {...register('minimumLoanAmount', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Lending Limit (%)" err={errors.lendingLimitPercentage?.message}>
            <input type="number" step="0.01" {...register('lendingLimitPercentage', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Fixed Asset LTV Ratio (%)" err={errors.fixedAssetLtvRatio?.message}>
            <input type="number" step="0.01" {...register('fixedAssetLtvRatio', { valueAsNumber: true })} className={inputCls} />
          </F>
        </div>
      </div>

      {/* Operational Parameters */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Operational Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <F label="Membership Threshold (months)" err={errors.membershipDurationThresholdMonths?.message}>
            <input type="number" {...register('membershipDurationThresholdMonths', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Loan Multiplier (below threshold)" err={errors.loanMultiplierBelowThreshold?.message}>
            <input type="number" step="0.1" {...register('loanMultiplierBelowThreshold', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Loan Multiplier (above threshold)" err={errors.loanMultiplierAboveThreshold?.message}>
            <input type="number" step="0.1" {...register('loanMultiplierAboveThreshold', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Contract Signing Deadline (days)" err={errors.contractSigningDeadlineDays?.message}>
            <input type="number" {...register('contractSigningDeadlineDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Loan Disbursement Deadline (days)" err={errors.loanDisbursementDeadlineDays?.message}>
            <input type="number" {...register('loanDisbursementDeadlineDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Loan Processing SLA (days)" err={errors.loanProcessingSlaDays?.message}>
            <input type="number" {...register('loanProcessingSlaDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Delinquency Grace Period (days)" err={errors.delinquencyGracePeriodDays?.message}>
            <input type="number" {...register('delinquencyGracePeriodDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Withdrawal Processing (days)" err={errors.memberWithdrawalProcessingDays?.message}>
            <input type="number" {...register('memberWithdrawalProcessingDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Collateral Appraisal Validity (months)" err={errors.collateralAppraisalValidityMonths?.message}>
            <input type="number" {...register('collateralAppraisalValidityMonths', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Vehicle Age Limit (years)" err={errors.vehicleAgeLimitYears?.message}>
            <input type="number" {...register('vehicleAgeLimitYears', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Deduction Decrease Waiting (months)" err={errors.deductionDecreaseWaitingMonths?.message}>
            <input type="number" {...register('deductionDecreaseWaitingMonths', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Non-Regular Savings Withdrawal (days)" err={errors.nonRegularSavingsWithdrawalDays?.message}>
            <input type="number" {...register('nonRegularSavingsWithdrawalDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Max Active Loans Per Member" err={errors.maximumActiveLoansPerMember?.message}>
            <input type="number" {...register('maximumActiveLoansPerMember', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Max Missed Deductions Before Suspension" err={errors.maxConsecutiveMissedDeductionsBeforeSuspension?.message}>
            <input type="number" {...register('maxConsecutiveMissedDeductionsBeforeSuspension', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Min. Membership Before Withdrawal (months)" err={errors.minimumMembershipDurationBeforeWithdrawalMonths?.message}>
            <input type="number" {...register('minimumMembershipDurationBeforeWithdrawalMonths', { valueAsNumber: true })} className={inputCls} />
          </F>
        </div>
      </div>

      {/* Penalties & Fees */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Penalties & Fees</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <F label="Late Payment Penalty Rate (%)" err={errors.latePaymentPenaltyRate?.message}>
            <input type="number" step="0.01" {...register('latePaymentPenaltyRate', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Late Payment Grace Period (days)" err={errors.latePaymentPenaltyGraceDays?.message}>
            <input type="number" {...register('latePaymentPenaltyGraceDays', { valueAsNumber: true })} className={inputCls} />
          </F>
          <F label="Early Repayment Penalty (%) — optional" err={errors.earlyLoanRepaymentPenalty?.message}>
            <input type="number" step="0.01" {...register('earlyLoanRepaymentPenalty', { valueAsNumber: true })} className={inputCls} placeholder="0" />
          </F>
          <F label="Withdrawal Processing Fee (ETB) — optional" err={errors.memberWithdrawalProcessingFee?.message}>
            <input type="number" step="0.01" {...register('memberWithdrawalProcessingFee', { valueAsNumber: true })} className={inputCls} placeholder="0" />
          </F>
          <F label="Share Transfer Fee (ETB) — optional" err={errors.shareTransferFee?.message}>
            <input type="number" step="0.01" {...register('shareTransferFee', { valueAsNumber: true })} className={inputCls} placeholder="0" />
          </F>
        </div>
      </div>

      {/* Effective Date */}
      <div className="max-w-xs">
        <F label="Effective Date" err={errors.effectiveDate?.message}>
          <input type="date" {...register('effectiveDate')} className={inputCls} />
        </F>
        <p className="text-xs text-amber-600 mt-1">⚠ Changes only affect future transactions.</p>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
        {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Save Configuration'}
      </button>
    </form>
  );
}
