'use client';

import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetAuditLogsQuery } from '@/features/audit/auditApi';
import { useGetMembersQuery } from '@/features/members/membersApi';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Pagination } from '@/components/common/Pagination';
import { exportToCsv } from '@/lib/exportCsv';
import type { AuditLog } from '@/types';

const ACTIONS = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'DEPOSIT', 'WITHDRAWAL',
  'SUSPEND', 'REACTIVATE', 'APPROVE', 'DENY', 'DISBURSE', 'REPAYMENT',
  'FREEZE', 'UNFREEZE', 'PAYROLL_GENERATE', 'PAYROLL_CONFIRM', 'DEDUCTION_CHANGE',
  'WITHDRAWAL_INITIATE', 'DEFAULT', 'LEGAL_ACTION', 'RESOLVE_DEFAULT', 'LOAN_PAID_OFF',
  'PENALTY', 'TRANSFER', 'RELEASE', 'LIQUIDATE', 'CONFIGURATION', 'INTEREST_APPLIED'];

const ENTITY_TYPES = ['USER', 'MEMBER', 'ACCOUNT', 'LOAN', 'LOAN_APPLICATION', 'LOAN_APPEAL',
  'LOAN_RESTRUCTURING', 'COLLATERAL', 'SHARE', 'PAYROLL', 'CONFIGURATION', 'DOCUMENT'];

const ACTION_COLORS: Record<string, string> = {
  CREATE:             'bg-green-100 text-green-700',
  UPDATE:             'bg-blue-100 text-blue-700',
  DELETE:             'bg-red-100 text-red-700',
  LOGIN:              'bg-purple-100 text-purple-700',
  LOGOUT:             'bg-gray-100 text-gray-600',
  DEPOSIT:            'bg-emerald-100 text-emerald-700',
  WITHDRAWAL:         'bg-orange-100 text-orange-700',
  SUSPEND:            'bg-yellow-100 text-yellow-700',
  REACTIVATE:         'bg-teal-100 text-teal-700',
  APPROVE:            'bg-green-100 text-green-700',
  DENY:               'bg-red-100 text-red-700',
  DISBURSE:           'bg-indigo-100 text-indigo-700',
  REPAYMENT:          'bg-cyan-100 text-cyan-700',
  FREEZE:             'bg-blue-100 text-blue-700',
  UNFREEZE:           'bg-teal-100 text-teal-700',
  PAYROLL_GENERATE:   'bg-violet-100 text-violet-700',
  PAYROLL_CONFIRM:    'bg-emerald-100 text-emerald-700',
  DEDUCTION_CHANGE:   'bg-amber-100 text-amber-700',
  WITHDRAWAL_INITIATE:'bg-orange-100 text-orange-700',
  DEFAULT:            'bg-red-100 text-red-700',
  LEGAL_ACTION:       'bg-red-100 text-red-700',
  RESOLVE_DEFAULT:    'bg-green-100 text-green-700',
  LOAN_PAID_OFF:      'bg-green-100 text-green-700',
  PENALTY:            'bg-yellow-100 text-yellow-700',
  TRANSFER:           'bg-blue-100 text-blue-700',
  RELEASE:            'bg-teal-100 text-teal-700',
  LIQUIDATE:          'bg-red-100 text-red-700',
  INTEREST_APPLIED:   'bg-sky-100 text-sky-700',
};

export default function AuditPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [filters, setFilters] = useState({
    entityType: '', action: '', startDate: '', endDate: '',
  });

  // Member search for userId filter
  const { data: membersData } = useGetMembersQuery(
    { page: 0, size: 10, search: memberSearch },
    { skip: memberSearch.length < 2 }
  );
  const memberSuggestions = membersData?.content ?? [];

  const { data, isLoading, isFetching } = useGetAuditLogsQuery({
    page,
    size: pageSize,
    sort: `${sortField},${sortDir}`,
    ...(selectedUserId    && { userId: selectedUserId }),
    ...(filters.entityType && { entityType: filters.entityType }),
    ...(filters.action     && { action: filters.action }),
    ...(filters.startDate  && { startDate: filters.startDate }),
    ...(filters.endDate    && { endDate: filters.endDate }),
  });

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(0);
  };

  const sortIcon = (field: string) => {
    if (field !== sortField) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleClear = () => {
    setFilters({ entityType: '', action: '', startDate: '', endDate: '' });
    setSelectedUserId('');
    setMemberSearch('');
    setPage(0);
  };

  const selectCls = 'px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300';
  const inputCls  = 'px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300';
  const thCls     = 'text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-50 select-none whitespace-nowrap';

  return (
    <RoleGuard allowedRoles={['MANAGER', 'AUDITOR', 'ADMINISTRATOR']}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all system actions and changes</p>
          </div>
          <button
            onClick={() => exportToCsv(logs as unknown as Record<string, unknown>[], 'audit_logs', [
              { key: 'timestamp', label: 'Timestamp' },
              { key: 'username', label: 'User' },
              { key: 'userId', label: 'User ID' },
              { key: 'action', label: 'Action' },
              { key: 'entityType', label: 'Entity Type' },
              { key: 'entityId', label: 'Entity ID' },
              { key: 'description', label: 'Description' },
              { key: 'ipAddress', label: 'IP Address' },
              { key: 'status', label: 'Status' },
              { key: 'errorMessage', label: 'Error Message' },
            ])}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Member search */}
            <div className="relative">
              <input
                className={inputCls}
                placeholder="Search member by name or ID…"
                value={memberSearch}
                onChange={(e) => { setMemberSearch(e.target.value); if (!e.target.value) setSelectedUserId(''); }}
                style={{ minWidth: 220 }}
              />
              {memberSuggestions.length > 0 && memberSearch.length >= 2 && !selectedUserId && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {memberSuggestions.map(m => (
                    <button
                      key={m.id}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSelectedUserId(m.id);
                        setMemberSearch(`${m.firstName} ${m.lastName}`);
                        setPage(0);
                      }}
                    >
                      {m.firstName} {m.lastName}
                      <span className="ml-2 text-xs text-gray-400 font-mono">{m.id.slice(0, 8)}…</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action dropdown */}
            <select
              className={selectCls}
              value={filters.action}
              onChange={(e) => { setFilters(f => ({ ...f, action: e.target.value })); setPage(0); }}
            >
              <option value="">All Actions</option>
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {/* Entity type dropdown */}
            <select
              className={selectCls}
              value={filters.entityType}
              onChange={(e) => { setFilters(f => ({ ...f, entityType: e.target.value })); setPage(0); }}
            >
              <option value="">All Entity Types</option>
              {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            {/* Date range */}
            <input type="date" className={inputCls} value={filters.startDate}
              onChange={(e) => { setFilters(f => ({ ...f, startDate: e.target.value })); setPage(0); }} />
            <input type="date" className={inputCls} value={filters.endDate}
              onChange={(e) => { setFilters(f => ({ ...f, endDate: e.target.value })); setPage(0); }} />

            <button onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors">
              Clear
            </button>
          </div>

          {/* Active filter chips */}
          {(selectedUserId || filters.action || filters.entityType) && (
            <div className="flex flex-wrap gap-2">
              {selectedUserId && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200">
                  User: {memberSearch}
                  <button className="ml-1 text-blue-400 hover:text-blue-600"
                    onClick={() => { setSelectedUserId(''); setMemberSearch(''); }}>×</button>
                </span>
              )}
              {filters.action && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200">
                  Action: {filters.action}
                  <button className="ml-1 text-blue-400 hover:text-blue-600"
                    onClick={() => setFilters(f => ({ ...f, action: '' }))}>×</button>
                </span>
              )}
              {filters.entityType && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200">
                  Entity: {filters.entityType}
                  <button className="ml-1 text-blue-400 hover:text-blue-600"
                    onClick={() => setFilters(f => ({ ...f, entityType: '' }))}>×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {(isLoading || isFetching) ? (
            <div className="flex justify-center py-12"><CircularProgress size={28} /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No audit logs found.</p>
              <p className="text-gray-300 text-xs mt-1">Perform some actions first, or adjust your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className={thCls} onClick={() => handleSort('timestamp')}>Timestamp {sortIcon('timestamp')}</th>
                    <th className={thCls} onClick={() => handleSort('username')}>User {sortIcon('username')}</th>
                    <th className={thCls} onClick={() => handleSort('action')}>Action {sortIcon('action')}</th>
                    <th className={thCls} onClick={() => handleSort('entityType')}>Entity Type {sortIcon('entityType')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log: AuditLog) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      >
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{log.username ?? log.userId}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs truncate max-w-[140px]">{log.entityId}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[220px] truncate">{log.description}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {expandedId === log.id ? '▲' : '▼'}
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-detail`} className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                              <div><span className="text-gray-400 font-medium">ID:</span> <span className="font-mono text-gray-600">{log.id}</span></div>
                              <div><span className="text-gray-400 font-medium">User ID:</span> <span className="font-mono text-gray-600">{log.userId ?? '—'}</span></div>
                              <div><span className="text-gray-400 font-medium">Username:</span> <span className="text-gray-700">{log.username ?? '—'}</span></div>
                              <div><span className="text-gray-400 font-medium">IP Address:</span> <span className="text-gray-700">{log.ipAddress ?? '—'}</span></div>
                              <div><span className="text-gray-400 font-medium">Status:</span>
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${log.status === 'FAILURE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                  {log.status ?? 'SUCCESS'}
                                </span>
                              </div>
                              <div><span className="text-gray-400 font-medium">Timestamp:</span> <span className="text-gray-700">{new Date(log.timestamp).toLocaleString()}</span></div>
                              <div className="col-span-2"><span className="text-gray-400 font-medium">Description:</span> <span className="text-gray-700">{log.description ?? '—'}</span></div>
                              {log.errorMessage && (
                                <div className="col-span-2"><span className="text-red-500 font-medium">Error:</span> <span className="text-red-600">{log.errorMessage}</span></div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          pageSizeOptions={[25, 50, 100, 200]}
        />
      </div>
    </RoleGuard>
  );
}
