'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircularProgress } from '@mui/material';
import { useCreateApplicationMutation } from '../loansApi';
import { MemberSearchInput } from '@/components/common/MemberSearchInput';
import { CollateralForm } from '@/features/collateral/components/CollateralForm';
import { DocumentManager } from '@/features/documents/components/DocumentManager';

const PURPOSES = ['BUSINESS', 'EDUCATION', 'MEDICAL', 'HOUSING', 'VEHICLE', 'EMERGENCY', 'OTHER'];

const schema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  requestedAmount: z.number().positive('Amount must be positive'),
  loanDurationMonths: z.number().int().min(1, 'Duration must be at least 1 month'),
  loanPurpose: z.string().min(1, 'Purpose is required'),
  purposeDescription: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess?: () => void;
}

type Step = 'form' | 'attachments';

export function LoanApplicationForm({ onSuccess }: Props) {
  const [createApplication, { isLoading, error }] = useCreateApplicationMutation();
  const [step, setStep] = useState<Step>('form');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submittedMemberId, setSubmittedMemberId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createApplication(data).unwrap() as any;
      // Backend returns the application ID (UUID string or object with id)
      const id = typeof result === 'string' ? result : result?.id ?? result;
      setApplicationId(String(id));
      setSubmittedMemberId(data.memberId);
      setStep('attachments');
    } catch {}
  };

  const handleFinish = () => {
    reset();
    setStep('form');
    setApplicationId(null);
    onSuccess?.();
  };

  const inputCls = 'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errCls = 'text-xs text-red-500 mt-1';

  // Step indicator
  const steps = [
    { n: 1, label: 'Application' },
    { n: 2, label: 'Collateral & Documents' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">New Loan Application</h3>
            <p className="text-sm text-gray-500">Submit a loan application for a member</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                step === 'form' && s.n === 1 ? 'bg-blue-600 text-white' :
                step === 'attachments' && s.n === 2 ? 'bg-blue-600 text-white' :
                step === 'attachments' && s.n === 1 ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step === 'attachments' && s.n === 1 ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{s.n}</span>
                )}
                {s.label}
              </div>
              {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Application form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {!!error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{String((error as any)?.data?.message ?? 'Failed to submit application')}</p>
            </div>
          )}

          <Controller
            name="memberId"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <MemberSearchInput
                label="Member *"
                placeholder="Search member by name or ID..."
                value={field.value}
                onChange={(id) => field.onChange(id)}
                error={errors.memberId?.message}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Requested Amount (ETB) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
                <input
                  type="number" step="0.01"
                  {...register('requestedAmount', { valueAsNumber: true })}
                  className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              {errors.requestedAmount && <p className={errCls}>{errors.requestedAmount.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Duration (months) *</label>
              <input type="number" {...register('loanDurationMonths', { valueAsNumber: true })} className={inputCls} placeholder="12" />
              {errors.loanDurationMonths && <p className={errCls}>{errors.loanDurationMonths.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Loan Purpose *</label>
            <select {...register('loanPurpose')} className={inputCls}>
              <option value="">Select purpose...</option>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
            {errors.loanPurpose && <p className={errCls}>{errors.loanPurpose.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea {...register('purposeDescription')} rows={2} className={inputCls} placeholder="Additional details..." />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <><CircularProgress size={16} color="inherit" /> Submitting...</> : 'Submit Application →'}
          </button>
        </form>
      )}

      {/* Step 2: Optional collateral + documents */}
      {step === 'attachments' && applicationId && (
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Application submitted successfully</p>
              <p className="text-xs text-green-600 mt-0.5">ID: <span className="font-mono">{applicationId.slice(0, 8)}…</span></p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Optional:</span> You can attach collateral and supporting documents now, or skip and add them later from the Pending Approval queue.
            </p>
          </div>

          {/* Collateral */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800">Collateral <span className="text-xs font-normal text-gray-400">(optional)</span></p>
            </div>
            <CollateralForm applicationId={applicationId} memberId={submittedMemberId ?? undefined} />
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800">Supporting Documents <span className="text-xs font-normal text-gray-400">(optional)</span></p>
            </div>
            <DocumentManager entityType="LOAN_APPLICATION" entityId={applicationId} canDelete={true} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleFinish}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Done — Go to All Loans
            </button>
            <button
              onClick={() => { reset(); setStep('form'); setApplicationId(null); }}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              New Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
