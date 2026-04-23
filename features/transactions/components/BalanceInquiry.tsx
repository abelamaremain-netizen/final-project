'use client';

import { useState } from 'react';
import { useGetAccountByIdQuery } from '@/features/accounts/accountsApi';

export function BalanceInquiry() {
  const [input, setInput] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);

  const { data: account, isLoading, isError } = useGetAccountByIdQuery(accountId!, {
    skip: !accountId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    // Force re-fetch even for same ID by clearing then setting
    setAccountId(null);
    setTimeout(() => setAccountId(trimmed), 0);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Balance Inquiry</h3>
        <p className="text-sm text-gray-500">Check account balance by ID</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter account ID"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Check
        </button>
      </form>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
      )}

      {isError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Account not found or an error occurred.
        </p>
      )}

      {account && !isLoading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ETB {Number(account.balance).toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {account.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-gray-800">{account.accountType?.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500">Available</p>
              <p className="font-medium text-green-700">ETB {Number(account.availableBalance).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500">Pledged</p>
              <p className="font-medium text-gray-800">ETB {Number(account.pledgedAmount).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500">Opened</p>
              <p className="font-medium text-gray-800">
                {account.createdDate ? new Date(account.createdDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
