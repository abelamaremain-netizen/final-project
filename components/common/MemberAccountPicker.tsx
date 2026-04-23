'use client';

import { useState, useCallback } from 'react';
import { useLazySearchMembersQuery } from '@/features/members/membersApi';
import { useGetAccountsByMemberQuery } from '@/features/accounts/accountsApi';
import type { AccountDto } from '@/features/accounts/accountsApi';

interface Props {
  onAccountSelected: (accountId: string, account: AccountDto) => void;
  accountTypeFilter?: 'REGULAR_SAVING' | 'NON_REGULAR_SAVING';
  label?: string;
}

export function MemberAccountPicker({ onAccountSelected, accountTypeFilter, label = 'Member' }: Props) {
  const [query, setQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');

  const [searchMembers, { data: members = [], isFetching }] = useLazySearchMembersQuery();
  const { data: accounts = [] } = useGetAccountsByMemberQuery(selectedMemberId, { skip: !selectedMemberId });

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.length >= 2) searchMembers(value);
  }, [searchMembers]);

  const handleSelectMember = (id: string, name: string) => {
    setSelectedMemberId(id);
    setSelectedMemberName(name);
    setQuery('');
  };

  const filteredAccounts = accountTypeFilter
    ? accounts.filter((a: AccountDto) => a.accountType === accountTypeFilter)
    : accounts;

  return (
    <div className="space-y-3">
      {/* Member search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">{label}</label>
        {selectedMemberId ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-sm font-medium text-blue-800">{selectedMemberName}</span>
            <button
              type="button"
              onClick={() => { setSelectedMemberId(''); setSelectedMemberName(''); }}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, national ID, or phone..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-white/40 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isFetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Searching...</span>
            )}
            {members.length > 0 && query.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m.id, `${m.firstName} ${m.lastName}`)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium text-gray-900">{m.firstName} {m.lastName}</span>
                    <span className="ml-2 text-xs text-gray-500">{m.nationalId}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account picker */}
      {selectedMemberId && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Account</label>
          {filteredAccounts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No accounts found for this member.</p>
          ) : (
            <div className="space-y-2">
              {filteredAccounts.map((acc: AccountDto) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onAccountSelected(acc.id, acc)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{acc.accountType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 font-mono">{acc.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-700">ETB {Number(acc.balance).toLocaleString()}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {acc.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
