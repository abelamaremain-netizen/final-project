'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateRegularAccountMutation, useCreateNonRegularAccountMutation, useDepositMutation } from '@/features/accounts/accountsApi';
import { useLazySearchMembersQuery } from '@/features/members/membersApi';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { SuccessSnackbar } from '@/components/common/SuccessSnackbar';

export default function NewAccountPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountType, setAccountType] = useState<'regular' | 'non-regular'>('regular');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [searchMembers, { data: members = [], isFetching }] = useLazySearchMembersQuery();
  const [createRegular, { isLoading: creatingRegular }] = useCreateRegularAccountMutation();
  const [createNonRegular, { isLoading: creatingNonRegular }] = useCreateNonRegularAccountMutation();
  const [deposit] = useDepositMutation();

  const isLoading = creatingRegular || creatingNonRegular;

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) searchMembers(value);
  }, [searchMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) { setSubmitError('Please select a member.'); return; }
    setSubmitError('');
    try {
      const result = accountType === 'regular'
        ? await createRegular(memberId).unwrap()
        : await createNonRegular(memberId).unwrap();

      // For non-regular, do initial deposit if provided
      const amt = parseFloat(initialDeposit);
      if (accountType === 'non-regular' && amt > 0) {
        await deposit({ accountId: result.id, data: { amount: amt, notes: 'Initial deposit' } }).unwrap();
      }

      setShowSuccess(true);
      setTimeout(() => router.push(`/dashboard/accounts/${result.id}`), 1500);
    } catch (err: any) {
      setSubmitError(err?.data?.message || 'Failed to create account.');
    }
  };

  return (
    <RoleGuard allowedRoles={['MANAGER', 'MEMBER_OFFICER']}>
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <div>
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-1 block">
            &larr; Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Create Account</h1>
        </div>

        {submitError && <ErrorAlert message={submitError} />}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* Member search */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Member *</label>
            {memberId ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-sm font-medium text-blue-800">{memberName}</span>
                <button type="button" onClick={() => { setMemberId(''); setMemberName(''); }}
                  className="text-xs text-blue-500 hover:text-blue-700">Change</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, national ID, or phone..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {isFetching && <span className="absolute right-3 top-2 text-xs text-gray-400">Searching...</span>}
                {members.length > 0 && searchQuery.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                    {members.map((m) => (
                      <button key={m.id} type="button"
                        onClick={() => { setMemberId(m.id); setMemberName(`${m.firstName} ${m.lastName}`); setSearchQuery(''); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0">
                        <span className="font-medium">{m.firstName} {m.lastName}</span>
                        <span className="ml-2 text-xs text-gray-500">{m.nationalId}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Account Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {(['regular', 'non-regular'] as const).map((type) => (
                <label key={type}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    accountType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input type="radio" name="accountType" value={type} checked={accountType === type}
                    onChange={() => setAccountType(type)} className="sr-only" />
                  <span className="text-sm font-medium text-gray-800">
                    {type === 'regular' ? 'Regular Savings' : 'Non-Regular Savings'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Regular savings info */}
          {accountType === 'regular' && (
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              Monthly deduction is set on the member profile. The committed deduction will be collected via payroll.
            </div>
          )}

          {/* Non-regular initial deposit */}
          {accountType === 'non-regular' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Deposit (ETB)</label>
              <input
                type="number" step="0.01" min="0"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="0.00 (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <LoadingSpinner size="sm" />}
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>

        <SuccessSnackbar open={showSuccess} message="Account created successfully!" onClose={() => setShowSuccess(false)} />
      </div>
    </RoleGuard>
  );
}
