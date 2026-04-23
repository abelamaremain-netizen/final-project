'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMembersQuery } from '@/features/members/membersApi';
import { useGetAccountsByMemberQuery } from '@/features/accounts/accountsApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Pagination } from '@/components/common/Pagination';
import Link from 'next/link';

function MemberAccountsTable({ memberId, memberName, router }: { memberId: string; memberName: string; router: ReturnType<typeof useRouter> }) {
  const { data: accounts = [], isLoading, error } = useGetAccountsByMemberQuery(memberId);

  if (isLoading) return <tr><td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">Loading...</td></tr>;
  if (error) return <tr><td colSpan={6} className="px-4 py-3 text-center text-sm text-red-500">Failed to load accounts</td></tr>;
  if (accounts.length === 0) return null;

  return (
    <>
      {accounts.map((account, idx) => (
        <tr
          key={account.id}
          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
          onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
        >
          <td className="px-4 py-3 text-sm text-blue-600 font-medium font-mono">{account.id.slice(0, 8)}…</td>
          <td className="px-4 py-3 text-sm text-gray-700">{idx === 0 ? memberName : ''}</td>
          <td className="px-4 py-3 text-sm text-gray-700">{account.accountType.replace(/_/g, ' ')}</td>
          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
            ETB {Number(account.balance).toLocaleString()}
          </td>
          <td className="px-4 py-3 text-sm text-center">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
              account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              account.status === 'FROZEN' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{account.status}</span>
          </td>
          <td className="px-4 py-3 text-sm text-center">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/accounts/${account.id}`); }}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              View
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AccountsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('lastName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: membersData, isLoading: membersLoading, error: membersError, refetch } = useGetMembersQuery({
    page,
    size: pageSize,
    search: debouncedSearch || undefined,
    sort: `${sortField},${sortDir}`,
  });
  const members = membersData?.content ?? [];
  const totalPages = membersData?.totalPages ?? 0;
  const totalElements = membersData?.totalElements ?? 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
    clearTimeout((handleSearchChange as any)._timer);
    (handleSearchChange as any)._timer = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(0);
  };

  const sortIcon = (field: string) => {
    if (field !== sortField) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (membersLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  if (membersError) return <div className="p-4"><ErrorAlert message="Failed to load members" onRetry={refetch} /></div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
        <RoleGuard allowedRoles={['MANAGER', 'MEMBER_OFFICER']}>
          <Link
            href="/dashboard/accounts/new"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Account
          </Link>
        </RoleGuard>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3">
        <input
          type="text"
          placeholder="Search by member name, national ID, or phone..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Account ID</th>
              <th
                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('lastName')}
              >
                Member {sortIcon('lastName')}
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Balance</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <MemberAccountsTable
                  key={member.id}
                  memberId={member.id}
                  memberName={`${member.firstName} ${member.lastName}`}
                  router={router}
                />
              ))
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        />
      </div>
    </div>
  );
}
