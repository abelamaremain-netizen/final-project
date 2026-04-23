'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMembersQuery } from '@/features/members/membersApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/app';
import { Pagination } from '@/components/common/Pagination';
import { exportToCsv } from '@/lib/exportCsv';
import type { Member } from '@/types';

type SortField = 'lastName' | 'firstName' | 'registrationDate' | 'status';
type SortDir = 'asc' | 'desc';

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <span className="ml-1 text-gray-300">↕</span>;
  return <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export default function MembersPage() {
  const router = useRouter();
  const { hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data, isLoading, error, refetch } = useGetMembersQuery({
    page,
    size: pageSize,
    search: debouncedQuery || undefined,
    sort: `${sortField},${sortDir}`,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(0);
    const timer = setTimeout(() => setDebouncedQuery(value), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const members = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const canCreateMember = hasAnyRole([ROLES.MANAGER, ROLES.MEMBER_OFFICER]);

  const thCls = 'px-3 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap';

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (error) return <div className="p-4"><ErrorAlert message="Failed to load members" onRetry={refetch} /></div>;

  return (
    <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.MEMBER_OFFICER, ROLES.ACCOUNTANT, ROLES.LOAN_OFFICER]}>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Members</h1>
            {totalElements > 0 && <p className="text-xs text-gray-500 mt-0.5">{totalElements} total</p>}
          </div>
          {canCreateMember && (
            <button
              onClick={() => router.push('/dashboard/members/new')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Member
            </button>
          )}
          <button
            onClick={() => exportToCsv(members as unknown as Record<string, unknown>[], 'members', [
              { key: 'id', label: 'ID' },
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'email', label: 'Email' },
              { key: 'phoneNumber', label: 'Phone' },
              { key: 'nationalId', label: 'National ID' },
              { key: 'memberType', label: 'Member Type' },
              { key: 'status', label: 'Status' },
              { key: 'registrationDate', label: 'Registration Date' },
              { key: 'committedDeduction', label: 'Committed Deduction' },
              { key: 'shareCount', label: 'Share Count' },
            ])}
            disabled={members.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <input
            type="text"
            placeholder="Search members by name, national ID, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className={thCls} onClick={() => handleSort('lastName')}>
                    Name <SortIcon field="lastName" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                  <th className={thCls} onClick={() => handleSort('registrationDate')}>
                    Registered <SortIcon field="registrationDate" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className={thCls} onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">No members found.</td></tr>
                ) : members.map((member: Member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/members/${member.id}`)}
                  >
                    <td className="px-3 py-2 text-sm text-gray-500 font-mono">{member.id.slice(0, 8)}…</td>
                    <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">{member.email}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{member.phoneNumber}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {member.registrationDate ? new Date(member.registrationDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        member.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/members/${member.id}`); }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
    </RoleGuard>
  );
}
