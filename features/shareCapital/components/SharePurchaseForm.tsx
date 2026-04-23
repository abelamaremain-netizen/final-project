'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircularProgress } from '@mui/material';
import { usePurchaseSharesMutation } from '@/features/shareCapital/shareCapitalApi';
import { MemberSearchInput } from '@/components/common/MemberSearchInput';

const schema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  sharesCount: z.number().int('Must be a whole number').positive('Must be positive'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  memberId?: string;
  onSuccess?: () => void;
}

export function SharePurchaseForm({ memberId, onSuccess }: Props) {
  const [success, setSuccess] = useState(false);
  const [purchaseShares, { isLoading, error }] = usePurchaseSharesMutation();

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { memberId: memberId ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await purchaseShares(data).unwrap();
      setSuccess(true);
      reset({ memberId: memberId ?? '' });
      onSuccess?.();
      setTimeout(() => setSuccess(false), 4000);
    } catch {}
  };

  const inputCls = 'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errCls = 'text-xs text-red-500 mt-1';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Purchase Shares</h3>
          <p className="text-sm text-gray-500">Buy cooperative shares for a member</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
        {success && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">Shares purchased successfully.</p>
          </div>
        )}
        {!!error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{String((error as any)?.data?.message ?? 'Failed to purchase shares')}</p>
          </div>
        )}

        {!memberId && (
          <Controller
            name="memberId"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <MemberSearchInput
                label="Member *"
                placeholder="Search by name or member number..."
                value={field.value}
                onChange={(id) => field.onChange(id)}
                error={errors.memberId?.message}
              />
            )}
          />
        )}

        <div>
          <label className={labelCls}>Number of Shares *</label>
          <input
            type="number"
            {...register('sharesCount', { valueAsNumber: true })}
            className={inputCls}
            placeholder="Enter number of shares"
            min="1"
          />
          {errors.sharesCount && <p className={errCls}>{errors.sharesCount.message}</p>}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-800">
            Share purchases are recorded in the member's passbook and contribute to their total share capital.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <CircularProgress size={16} color="inherit" />
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Purchase Shares
            </>
          )}
        </button>
      </form>
    </div>
  );
}
