'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMemberMutation } from '@/features/members/membersApi';
import { useGetCurrentConfigQuery } from '@/features/config/configApi';
import { useGetActiveCategoriesQuery } from '@/features/memberTypeCategories/memberTypeCategoriesApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SuccessSnackbar } from '@/components/common/SuccessSnackbar';
import { ErrorAlert } from '@/components/common/ErrorAlert';

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-700 mb-1';
const errCls = 'text-xs text-red-500 mt-1';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className={errCls}>{error}</p>}
    </div>
  );
}

interface Props { onSuccess?: () => void; }

export function MemberForm({ onSuccess }: Props) {
  const router = useRouter();
  const [createMember, { isLoading, error }] = useCreateMemberMutation();
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: config } = useGetCurrentConfigQuery();
  const { data: memberTypeCategories = [] } = useGetActiveCategoriesQuery();

  const minShares = config?.minimumSharesRequired ?? 3;
  const minDeduction = config?.minimumMonthlyDeduction ?? 0;

  const schema = z.object({
    memberType: z.string().min(1, 'Member type is required'),
    firstName: z.string().min(2, 'Required'),
    lastName: z.string().min(2, 'Required'),
    dateOfBirth: z.string().min(1, 'Required'),
    nationalId: z.string().min(1, 'Required'),
    phoneNumber: z.string().min(1, 'Required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    employmentStatus: z.string().min(1, 'Required'),
    committedDeduction: z.number()
      .positive('Required')
      .min(minDeduction, `Minimum deduction is ETB ${minDeduction}`),
    shareCount: z.number().int()
      .min(minShares, `Minimum ${minShares} shares required`)
      .optional(),
    externalCooperativeName: z.string().optional(),
    externalCooperativeMemberId: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { memberType: 'REGULAR', shareCount: minShares },
  });

  const memberType = watch('memberType');

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createMember({
        ...data,
        email: data.email || undefined,
      }).unwrap();
      setShowSuccess(true);
      reset({ memberType: 'REGULAR', shareCount: minShares });
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess ? onSuccess() : router.push(`/dashboard/members/${result.id}`);
      }, 2000);
    } catch (err) {
      console.error('Failed to create member:', err);
    }
  };

  const errorMessage = (() => {
    if (!error) return null;
    const e = error as any;
    if (e?.data?.message) return e.data.message;
    if (e?.data?.errors) return Object.values(e.data.errors).join(', ');
    return 'Failed to create member. Please check your input and try again.';
  })();

  return (
    <div className="space-y-4">
      {errorMessage && <ErrorAlert message={errorMessage} />}

      {/* Config hints */}
      {config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex gap-4 flex-wrap">
          <span>Min. shares: <strong>{minShares}</strong></span>
          <span>Min. deduction: <strong>ETB {minDeduction}</strong></span>
          <span>Share price: <strong>ETB {config.sharePricePerShare}</strong></span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Member Type *" error={errors.memberType?.message}>
              <select {...register('memberType')} className={inputCls}>
                <option value="">Select member type...</option>
                {memberTypeCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </Field>
            <Field label="First Name *" error={errors.firstName?.message}>
              <input {...register('firstName')} className={inputCls} />
            </Field>
            <Field label="Last Name *" error={errors.lastName?.message}>
              <input {...register('lastName')} className={inputCls} />
            </Field>
            <Field label="Date of Birth *" error={errors.dateOfBirth?.message}>
              <input type="date" {...register('dateOfBirth')} className={inputCls} />
            </Field>
            <Field label="National ID *" error={errors.nationalId?.message}>
              <input {...register('nationalId')} className={inputCls} />
            </Field>
            <Field label="Phone Number *" error={errors.phoneNumber?.message}>
              <input {...register('phoneNumber')} placeholder="+251912345678" className={inputCls} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" {...register('email')} className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Address</h2>
          <Field label="Address">
            <input {...register('address')} className={inputCls} placeholder="Street, City, Region" />
          </Field>
        </div>

        {/* Employment */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Employment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Employment Status *" error={errors.employmentStatus?.message}>
              <select {...register('employmentStatus')} className={inputCls}>
                <option value="">Select...</option>
                <option value="PERMANENT">Permanent</option>
                <option value="CONTRACT">Contract</option>
                <option value="PART_TIME">Part Time</option>
              </select>
            </Field>
            <Field label={`Committed Monthly Deduction (ETB, min. ${minDeduction}) *`} error={errors.committedDeduction?.message}>
              <input type="number" step="0.01"
                {...register('committedDeduction', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(v) ? undefined : Number(v) })}
                className={inputCls} />
            </Field>
            {memberType === 'REGULAR' && (
              <Field label={`Initial Share Count (min. ${minShares})`} error={errors.shareCount?.message}>
                <input type="number"
                  {...register('shareCount', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(v) ? undefined : Number(v) })}
                  className={inputCls} />
              </Field>
            )}
          </div>
        </div>

        {/* External Cooperative */}
        {memberType === 'EXTERNAL_COOPERATIVE' && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">External Cooperative</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Cooperative Name">
                <input {...register('externalCooperativeName')} className={inputCls} />
              </Field>
              <Field label="Cooperative Member ID">
                <input {...register('externalCooperativeMemberId')} className={inputCls} />
              </Field>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
            disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {isLoading && <LoadingSpinner size="sm" />}
            {isLoading ? 'Creating...' : 'Create Member'}
          </button>
        </div>
      </form>

      {showSuccess && (
        <SuccessSnackbar message="Member created successfully!" onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
