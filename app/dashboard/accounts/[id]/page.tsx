'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetAccountByIdQuery,
  useGetAccountTransactionsQuery,
  useFreezeAccountMutation,
  useUnfreezeAccountMutation,
} from '@/features/accounts/accountsApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { RoleGuard } from '@/components/auth/RoleGuard';
import Link from 'next/link';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const [txPage, setTxPage] = useState(0);
  const [txType, setTxType] = useState('');

  const { data: account, isLoading, error, refetch } = useGetAccountByIdQuery(accountId);
  const { data: txData, isLoading: txLoading } =
    useGetAccountTransactionsQuery({ id: accountId, page: txPage, size: 20 });
  const transactions = txData?.content ?? [];
  const txTotalPages = txData?.totalPages ?? 1;
  const [freezeAccount, { isLoading: freezing }] = useFreezeAccountMutation();
  const [unfreezeAccount, { isLoading: unfreezing }] = useUnfreezeAccountMutation();

  const handleFreeze = async () => {
    try {
      await freezeAccount({ id: accountId }).unwrap();
      refetch();
    } catch {}
  };
  const handleUnfreeze = async () => {
    try {
      await unfreezeAccount(accountId).unwrap();
      refetch();
    } catch {}
  };

  const filtered = txType
    ? transactions.filter((tx: any) => tx.transactionType === txType)
    : transactions;

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="p-4">
        <ErrorAlert message="Failed to load account" onRetry={refetch} />
      </div>
    );
  if (!account) return <div className="p-4 text-gray-500">Account not found.</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:underline mb-1 block"
          >
            &larr; Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Account Details</h1>
          <p className="text-sm text-gray-500">{account.accountType.replace(/_/g, ' ')}</p>
        </div>
        <RoleGuard allowedRoles={['MANAGER']}>
          <div className="flex gap-2">
            {account.status === 'ACTIVE' && (
              <button
                onClick={handleFreeze}
                disabled={freezing}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {freezing ? 'Freezing...' : 'Freeze'}
              </button>
            )}
            {account.status === 'FROZEN' && (
              <button
                onClick={handleUnfreeze}
                disabled={unfreezing}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {unfreezing ? 'Unfreezing...' : 'Unfreeze'}
              </button>
            )}
          </div>
        </RoleGuard>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Type</p>
          <p className="text-sm font-semibold text-gray-900">
            {account.accountType.replace(/_/g, ' ')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Balance</p>
          <p className="text-sm font-bold text-green-700">
            ETB {Number(account.balance).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-sm font-semibold text-gray-900">
            ETB {Number(account.availableBalance).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
              account.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : account.status === 'FROZEN'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {account.status}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pledged</p>
          <p className="text-sm text-gray-700">
            ETB {Number(account.pledgedAmount).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Interest Rate</p>
          <p className="text-sm text-gray-700">{account.interestRate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Opened</p>
          <p className="text-sm text-gray-700">
            {account.createdDate ? new Date(account.createdDate).toLocaleDateString() : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Member</p>
          <Link
            href={`/dashboard/members/${account.memberId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            View Member
          </Link>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Transaction History</h2>
          <select
            value={txType}
            onChange={(e) => { setTxType(e.target.value); setTxPage(0); }}
            className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
          </select>
        </div>
        {txLoading ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">No transactions found.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Notes</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                  Balance After
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx: any) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        tx.transactionType === 'DEPOSIT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{tx.notes || '-'}</td>
                  <td
                    className={`px-4 py-2 text-sm font-semibold text-right ${
                      tx.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.transactionType === 'DEPOSIT' ? '+' : '-'}ETB{' '}
                    {Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-900">
                    ETB {Number(tx.balanceAfter).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        {txTotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {txPage + 1} of {txTotalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setTxPage((p) => Math.max(0, p - 1))}
                disabled={txPage === 0}
                className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setTxPage((p) => Math.min(txTotalPages - 1, p + 1))}
                disabled={txPage >= txTotalPages - 1}
                className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
