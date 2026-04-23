'use client';

import { useState } from 'react';
import { useWithdrawMutation, useGetAccountByIdQuery } from '@/features/accounts/accountsApi';
import { MemberAccountPicker } from '@/components/common/MemberAccountPicker';
import type { AccountDto } from '@/features/accounts/accountsApi';

interface Props {
  accountId?: string;
  onSuccess?: () => void;
}

export function WithdrawalForm({ accountId: fixedAccountId, onSuccess }: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState(fixedAccountId ?? '');
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: prefilledAccount } = useGetAccountByIdQuery(fixedAccountId!, { skip: !fixedAccountId });
  const accountInfo = fixedAccountId ? prefilledAccount : selectedAccount;
  const [withdraw, { isLoading }] = useWithdrawMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) { setErrorMsg('Please select an account.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setErrorMsg('Enter a valid amount.'); return; }
    setErrorMsg('');
    setSuccess(null);
    try {
      const result = await withdraw({ accountId: selectedAccountId, data: { amount: amt, notes } }).unwrap();
      setSuccess(`Withdrawal successful! New balance: ETB ${Number(result.balanceAfter).toLocaleString()}`);
      setAmount('');
      setNotes('');
      onSuccess?.();
    } catch (e: any) {
      setErrorMsg(e?.data?.message ?? e?.message ?? 'Withdrawal failed.');
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Withdrawal</h3>
          <p className="text-sm text-gray-500">Withdraw funds from a member account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Account selection */}
        {fixedAccountId ? (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
            <p className="text-xs text-gray-500 mb-0.5">Account</p>
            <p className="font-mono text-gray-700 text-xs">{fixedAccountId}</p>
            {accountInfo && <p className="text-gray-600 mt-0.5">{accountInfo.accountType.replace(/_/g, ' ')}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Account</label>
            <MemberAccountPicker
              onAccountSelected={(id, acc) => { setSelectedAccountId(id); setSelectedAccount(acc); setErrorMsg(''); setSuccess(null); }}
            />
          </div>
        )}

        {/* Balance info */}
        {accountInfo && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Current Balance</p>
              <p className="text-base font-bold text-gray-900">ETB {Number(accountInfo.balance).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Available</p>
              <p className="text-base font-bold text-green-700">ETB {Number(accountInfo.availableBalance).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (ETB) *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
            <input
              type="number" step="0.01" min="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrorMsg(''); setSuccess(null); }}
              className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text" value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls}
            placeholder="e.g. Emergency withdrawal"
          />
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-800">Ensure sufficient available balance before processing.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedAccountId}
          className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Process Withdrawal
            </>
          )}
        </button>
      </form>
    </div>
  );
}
