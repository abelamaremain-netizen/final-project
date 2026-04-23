'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DepositForm } from '@/features/transactions/components/DepositForm';
import { WithdrawalForm } from '@/features/transactions/components/WithdrawalForm';
import { BalanceInquiry } from '@/features/transactions/components/BalanceInquiry';
import { MemberAccountPicker } from '@/components/common/MemberAccountPicker';
import { useGetAccountTransactionsQuery } from '@/features/accounts/accountsApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Pagination } from '@/components/common/Pagination';
import { exportToCsv } from '@/lib/exportCsv';

type TabId = 'deposit' | 'withdrawal' | 'balance' | 'history';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'deposit',
    label: 'Deposit',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  },
  {
    id: 'balance',
    label: 'Balance Inquiry',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const prefilledAccountId = searchParams.get('accountId') ?? undefined;
  const prefilledAction = searchParams.get('action');

  const [activeTab, setActiveTab] = useState<TabId>(
    prefilledAction === 'withdraw' ? 'withdrawal' : 'deposit'
  );

  useEffect(() => {
    if (prefilledAction === 'withdraw') setActiveTab('withdrawal');
    else if (prefilledAction === 'deposit') setActiveTab('deposit');
  }, [prefilledAction]);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [historyAccountId, setHistoryAccountId] = useState('');

  const { data: transactions, isLoading, error, refetch } = useGetAccountTransactionsQuery(
    { id: historyAccountId, page, size: pageSize },
    { skip: activeTab !== 'history' || !historyAccountId }
  );

  return (
    <RoleGuard allowedRoles={['MANAGER', 'ACCOUNTANT']}>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage deposits, withdrawals, and view transaction history</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'deposit' && (
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <DepositForm accountId={prefilledAccountId} onSuccess={undefined} />
            </div>
          </div>
        )}

        {activeTab === 'withdrawal' && (
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <WithdrawalForm accountId={prefilledAccountId} onSuccess={undefined} />
            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <BalanceInquiry />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Account picker */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Account</h3>
              <MemberAccountPicker
                onAccountSelected={(id) => { setHistoryAccountId(id); setPage(0); }}
              />
              {historyAccountId && (
                <button
                  onClick={() => { setHistoryAccountId(''); setPage(0); }}
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Transaction list */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Transaction History</h3>
                {transactions && transactions.content.length > 0 && (
                  <button
                    onClick={() => exportToCsv(
                      transactions.content as unknown as Record<string, unknown>[],
                      'transactions',
                      [
                        { key: 'id', label: 'ID' },
                        { key: 'transactionType', label: 'Type' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'balanceBefore', label: 'Balance Before' },
                        { key: 'balanceAfter', label: 'Balance After' },
                        { key: 'transactionDate', label: 'Date' },
                        { key: 'reference', label: 'Reference' },
                        { key: 'notes', label: 'Notes' },
                        { key: 'processedBy', label: 'Processed By' },
                      ]
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="p-8 flex justify-center"><LoadingSpinner /></div>
              ) : error ? (
                <div className="p-5"><ErrorAlert error={error as any} onRetry={refetch} /></div>
              ) : !historyAccountId ? (
                <div className="p-8 text-center text-gray-400 text-sm">Select a member account to view transactions</div>
              ) : transactions && transactions.content.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {transactions.content.map((tx) => (
                      <div key={tx.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                              tx.transactionType === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {tx.transactionType === 'DEPOSIT' ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{tx.transactionType}</p>
                              <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tx.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.transactionType === 'DEPOSIT' ? '+' : '-'}ETB {Number(tx.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">Bal: ETB {Number(tx.balanceAfter).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    page={page}
                    totalPages={transactions.totalPages}
                    totalElements={transactions.totalElements}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
                  />
                </>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No transactions found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
