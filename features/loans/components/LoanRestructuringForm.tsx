'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircularProgress } from '@mui/material';
import { useInitiateRestructuringMutation } from '../loansApi';

const schema = z.object({
  restructuringReason: z.string().min(10, 'Please provide a detailed reason'),
  newDurationMonths: z.number().int().positive('Duration must be a positive integer'),
  newInterestRate: z.number()
    .min(13, 'Interest rate must be at least 13%')
    .max(19, 'Interest rate cannot exceed 19%'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  loanId: string;
  onSuccess?: () => void;
}

export function LoanRestructuringForm({ loanId, onSuccess }: Props) {
  const [initiateRestructuring, { isLoading, error, isSuccess }] = useInitiateRestructuringMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await initiateRestructuring({
        loanId,
        ...data,
        newInterestRate: data.newInterestRate / 100, // convert % to decimal for backend
      }).unwrap();
      reset();
      onSuccess?.();
    } catch {}
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
  const errCls = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {Boolean(isSuccess) && (
        <div className="p-3 rounded-xl bg-green-50/80 border border-green-200 text-green-700 text-sm">
          Restructuring request submitted successfully.
        </div>
      )}
      {Boolean(error) && (
        <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-sm">
          {String((error as any)?.data?.message ?? 'Failed to submit restructuring request')}
        </div>
      )}
      <div>
        <label className={labelCls}>Reason for Restructuring</label>
        <textarea {...register('restructuringReason')} rows={3} className={inputCls} placeholder="Explain why restructuring is needed..." />
        {errors.restructuringReason && <p className={errCls}>{errors.restructuringReason.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>New Duration (months)</label>
          <input type="number" {...register('newDurationMonths', { valueAsNumber: true })} className={inputCls} placeholder="24" />
          {errors.newDurationMonths && <p className={errCls}>{errors.newDurationMonths.message}</p>}
        </div>
        <div>
          <label className={labelCls}>New Interest Rate (%, 13–19)</label>
          <input type="number" step="0.01" min="13" max="19" {...register('newInterestRate', { valueAsNumber: true })} className={inputCls} placeholder="13–19" />
          {errors.newInterestRate && <p className={errCls}>{errors.newInterestRate.message}</p>}
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? <CircularProgress size={16} color="inherit" /> : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
        {isLoading ? 'Submitting...' : 'Request Restructuring'}
      </button>
    </form>
  );
}
