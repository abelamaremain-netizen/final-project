'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircularProgress } from '@mui/material';
import { useRecordRepaymentMutation } from '../loansApi';

const schema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  amount: z.number().positive('Amount must be positive'),
});

type FormData = { loanId: string; amount: number };

interface Props {
  loanId?: string;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

export function LoanRepaymentForm({ loanId, suggestedAmount, onSuccess }: Props) {
  const [recordRepayment, { isLoading, error }] = useRecordRepaymentMutation();
  const [warning, setWarning] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { loanId: loanId ?? '', amount: suggestedAmount ?? ('' as any) },
  });

  const onSubmit = async (formData: FormData) => {
    setWarning(null);
    setSuccess(false);
    try {
      const result = await recordRepayment({ loanId: formData.loanId, amount: formData.amount }).unwrap() as any;
      setSuccess(true);
      if (result?.warning) setWarning(result.warning);
      reset({ loanId: loanId ?? '', amount: suggestedAmount ?? ('' as any) });
      onSuccess?.();
    } catch {}
  };

  const inputCls = 'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errCls = 'text-xs text-red-500 mt-1';

  return (
    <div className="space-y-4">
      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-700">Repayment recorded successfully.</p>
        </div>
      )}
      {warning && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">{warning}</p>
        </div>
      )}
      {!!error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{String((error as any)?.data?.message ?? (error as any)?.message ?? 'Failed to record repayment')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!loanId && (
          <div>
            <label className={labelCls}>Loan ID *</label>
            <input {...register('loanId')} className={inputCls} placeholder="Enter loan ID" />
            {errors.loanId && <p className={errCls}>{errors.loanId.message}</p>}
          </div>
        )}

        <div>
          <label className={labelCls}>Repayment Amount (ETB) *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
            <input
              type="number" step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className={errCls}>{errors.amount.message}</p>}
          {suggestedAmount && (
            <p className="text-xs text-gray-500 mt-1">
              Suggested: <span className="font-semibold text-green-700">ETB {suggestedAmount.toFixed(2)}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <CircularProgress size={16} color="inherit" />
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Record Repayment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
