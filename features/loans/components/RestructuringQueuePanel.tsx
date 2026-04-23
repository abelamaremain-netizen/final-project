'use client';

import React, { useState, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import {
  useGetPendingRestructuringsQuery,
  useApproveRestructuringMutation,
  useDenyRestructuringMutation,
} from '../loansApi';
import { toastSuccess, toastError } from '@/components/common/Toast';
import { Pagination } from '@/components/common/Pagination';
import type { LoanRestructuring } from '@/types';

type SortField = 'requestedAt' | 'newDurationMonths' | 'newInterestRate';

export function RestructuringQueuePanel() {
  const { data: pending = [], isLoading, refetch } = useGetPendingRestructuringsQuery();
  const [approveRestructuring] = useApproveRestructuringMutation();
  const [denyRestructuring] = useDenyRestructuringMutation();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [denyTarget, setDenyTarget] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('requestedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const sorted = useMemo(() => {
    return [...pending].sort((a, b) => {
      if (sortField === 'requestedAt') {
        const av = new Date(a.requestedAt ?? a.requestDate ?? 0).getTime();
        const bv = new Date(b.requestedAt ?? b.requestDate ?? 0).getTime();
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const av = Number((a as any)[sortField] ?? 0);
      const bv = Number((b as any)[sortField] ?? 0);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [pending, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(0);
  };

  const sortIcon = (field: SortField) => {
    if (field !== sortField) return <span className="ml-0.5 text-gray-300 text-xs">↕</span>;
    return <span className="ml-0.5 text-blue-500 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveRestructuring(id).unwrap();
      toastSuccess('Restructuring approved');
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to approve restructuring');
    } finally { setProcessingId(null); }
  };

  const handleDeny = async () => {
    if (!denyTarget || !denyReason.trim()) return;
    setProcessingId(denyTarget);
    try {
      await denyRestructuring({ id: denyTarget, reason: denyReason }).unwrap();
      toastSuccess('Restructuring denied');
      setDenyTarget(null); setDenyReason('');
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to deny restructuring');
    } finally { setProcessingId(null); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><CircularProgress size={24} /></div>;

  if (pending.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No pending restructuring requests</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Loan ID</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Reason</th>
            <th
              className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
              onClick={() => handleSort('newDurationMonths')}
            >
              New Duration {sortIcon('newDurationMonths')}
            </th>
            <th
              className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
              onClick={() => handleSort('newInterestRate')}
            >
              New Rate {sortIcon('newInterestRate')}
            </th>
            <th
              className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
              onClick={() => handleSort('requestedAt')}
            >
              Requested {sortIcon('requestedAt')}
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paged.map((r: LoanRestructuring) => (
            <React.Fragment key={r.id}>
              <tr
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{(r.originalLoanId ?? r.loanId)?.slice(0, 8)}…</td>
                <td className="px-4 py-2.5 text-gray-700 max-w-[160px] truncate text-xs">{r.restructuringReason}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.newDurationMonths}mo</td>
                <td className="px-4 py-2.5 text-gray-600">{(Number(r.newInterestRate) * 100).toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                  {(r.requestedAt ?? r.requestDate) ? new Date(r.requestedAt ?? r.requestDate!).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  {denyTarget !== r.id && (
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={processingId === r.id}
                        className="px-2.5 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === r.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => { setDenyTarget(r.id); setDenyReason(''); setExpandedId(r.id); }}
                        className="px-2.5 py-1 rounded-md border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </td>
              </tr>

              {expandedId === r.id && (
                <tr key={`${r.id}-detail`}>
                  <td colSpan={6} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    {denyTarget === r.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={denyReason}
                          onChange={(e) => setDenyReason(e.target.value)}
                          placeholder="Reason for denial..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-md border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none bg-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeny}
                            disabled={!denyReason.trim() || processingId === r.id}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm Denial
                          </button>
                          <button onClick={() => { setDenyTarget(null); setDenyReason(''); }} className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-white">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="text-gray-400">Requested by:</span> {r.requestedBy}</p>
                        <p><span className="text-gray-400">Reason:</span> {r.restructuringReason}</p>
                        {(r as any).outstandingAtRestructure && (
                          <p><span className="text-gray-400">Outstanding at restructure:</span> ETB {Number((r as any).outstandingAtRestructure?.amount ?? 0).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={sorted.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={() => {}}
        pageSizeOptions={[10]}
      />
    </div>
  );
}
