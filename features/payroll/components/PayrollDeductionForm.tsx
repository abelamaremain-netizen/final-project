'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircularProgress, Alert } from '@mui/material';
import { useProcessConfirmationMutation } from '../payrollApi';

const schema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  deductionMonth: z.string().min(7, 'Required (YYYY-MM)'),
  amount: z.number().positive('Amount must be positive'),
  employerReference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultMemberId?: string;
  onSuccess?: () => void;
}

export function PayrollDeductionForm({ defaultMemberId, onSuccess }: Props) {
  const [processConfirmation, { isLoading, isSuccess, error }] = useProcessConfirmationMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { memberId: defaultMemberId ?? '', deductionMonth: '', amount: 0 },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await processConfirmation(data).unwrap();
      reset({ memberId: defaultMemberId ?? '', deductionMonth: '', amount: 0 });
      onSuccess?.();
    } catch {}
  };

  const errMsg = error && typeof error === 'object' && 'data' in error
    ? (error as any).data?.message : 'Failed to process confirmation';

  const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/60 border border-white/40 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
  const errCls = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSuccess && <Alert severity="success" className="rounded-xl">Deduction confirmed successfully.</Alert>}
      {Boolean(error) && <Alert severity="error" className="rounded-xl">{errMsg}</Alert>}

      <div>
        <label className={labelCls}>Member ID</label>
        <input {...register('memberId')} className={inputCls} readOnly={!!defaultMemberId} />
        {errors.memberId && <p className={errCls}>{errors.memberId.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Deduction Month (YYYY-MM)</label>
        <input {...register('deductionMonth')} className={inputCls} placeholder="2024-01" />
        {errors.deductionMonth && <p className={errCls}>{errors.deductionMonth.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Confirmed Amount (ETB)</label>
        <input type="number" step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className={inputCls} placeholder="0.00" />
        {errors.amount && <p className={errCls}>{errors.amount.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Employer Reference (optional)</label>
        <input {...register('employerReference')} className={inputCls} />
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
        {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Confirm Deduction'}
      </button>
    </form>
  );
}
