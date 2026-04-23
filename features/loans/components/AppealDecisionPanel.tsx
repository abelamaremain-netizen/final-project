'use client';

import React, { useState, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetPendingAppealsQuery, useRecordAppealDecisionMutation } from '../loansApi';
import { toastSuccess, toastError } from '@/components/common/Toast';
import { Pagination } from '@/components/common/Pagination';
import type { LoanAppeal } from '@/types';

type SortField = 'submissionDate' | 'applicationId';

export function AppealDecisionPanel() {
  const { data: appeals = [], isLoading, refetch } = useGetPendingAppealsQuery();
  const [recordDecision, { isLoading: deciding }] = useRecordAppealDecisionMutation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const [sortField, setSortField] = useState<SortField>('submissionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const sorted = useMemo(() => {
    return [...appeals].sort((a, b) => {
      if (sortField === 'submissionDate') {
        const av = new Date(a.submissionDate ?? 0).getTime();
        const bv = new Date(b.submissionDate ?? 0).getTime();
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? a.applicationId.localeCompare(b.applicationId)
        : b.applicationId.localeCompare(a.applicationId);
    });
  }, [appeals, sortField, sortDir]);

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

  const handleDecision = async (appeal: LoanAppeal, action: 'APPROVED' | 'REJECTED') => {
    try {
      await recordDecision({ id: appeal.id, decision: action, decisionNotes: notes || undefined }).unwrap();
      toastSuccess(`Appeal ${action === 'APPROVED' ? 'approved' : 'rejected'}`);
      setExpandedId(null); setNotes('');
      refetch();
    } catch (e: any) { toastError(e?.data?.message ?? 'Failed to record decision'); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><CircularProgress size={24} /></div>;

  if (appeals.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No pending appeals</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
              onClick={() => handleSort('applicationId')}
            >
              Application {sortIcon('applicationId')}
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Reason</th>
            <th
              className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
              onClick={() => handleSort('submissionDate')}
            >
              Submitted {sortIcon('submissionDate')}
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paged.map((appeal: LoanAppeal) => (
            <React.Fragment key={appeal.id}>
              <tr
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => { setExpandedId(expandedId === appeal.id ? null : appeal.id); setNotes(''); }}
              >
                <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{appeal.applicationId?.slice(0, 8)}…</td>
                <td className="px-4 py-2.5 text-gray-700 max-w-[200px] truncate text-xs">{appeal.appealReason}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                  {appeal.submissionDate ? new Date(appeal.submissionDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">PENDING</span>
                </td>
              </tr>

              {expandedId === appeal.id && (
                <tr key={`${appeal.id}-detail`}>
                  <td colSpan={4} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-600 mb-3">{appeal.appealReason}</p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Decision notes (optional)"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none bg-white mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(appeal, 'APPROVED')}
                        disabled={deciding}
                        className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {deciding && <CircularProgress size={10} color="inherit" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(appeal, 'REJECTED')}
                        disabled={deciding}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button onClick={() => setExpandedId(null)} className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-white">
                        Cancel
                      </button>
                    </div>
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
