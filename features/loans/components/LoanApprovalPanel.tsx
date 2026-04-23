'use client';

import React, { useState, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import {
  useGetPendingApplicationsQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useStartReviewMutation,
} from '../loansApi';
import { toastSuccess, toastError } from '@/components/common/Toast';
import { CollateralForm } from '@/features/collateral/components/CollateralForm';
import { DocumentManager } from '@/features/documents/components/DocumentManager';
import { Pagination } from '@/components/common/Pagination';
import type { LoanApplication } from '@/types';

type SortField = 'submissionDate' | 'requestedAmount' | 'loanDurationMonths';

export function LoanApprovalPanel() {
  const { data, isLoading } = useGetPendingApplicationsQuery();
  const [approve, { isLoading: approving }] = useApproveApplicationMutation();
  const [startReview] = useStartReviewMutation();
  const [reject, { isLoading: rejecting }] = useRejectApplicationMutation();

  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Client-side sort + pagination
  const [sortField, setSortField] = useState<SortField>('submissionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const applications = data ?? [];

  const sorted = useMemo(() => {
    return [...applications].sort((a, b) => {
      let av: any = a[sortField];
      let bv: any = b[sortField];
      if (sortField === 'submissionDate') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      else { av = Number(av ?? 0); bv = Number(bv ?? 0); }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [applications, sortField, sortDir]);

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

  const handleApprove = async (app: LoanApplication) => {
    try {
      if ((app.status as string) === 'PENDING') await startReview(app.id).unwrap();
      await approve(app.id).unwrap();
      toastSuccess('Loan application approved');
      setApproveTarget(null);
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to approve application');
      setApproveTarget(null);
    }
  };

  const handleReject = async (app: LoanApplication) => {
    if (!rejectReason.trim()) { setRejectError('Rejection reason is required'); return; }
    try {
      if ((app.status as string) === 'PENDING') await startReview(app.id).unwrap();
      await reject({ id: app.id, reason: rejectReason }).unwrap();
      toastSuccess('Application rejected');
      setRejectTarget(null); setRejectReason(''); setRejectError('');
    } catch (e: any) { toastError(e?.data?.message ?? 'Failed to reject application'); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><CircularProgress size={24} /></div>;

  if (applications.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No pending applications</div>;
  }

  return (
    <div className="space-y-3">
      {/* Document reminder */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-800">Ensure all required documents (ID copy, employment letter, collateral proof) are uploaded before approving.</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">ID</th>
              <th
                className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort('requestedAmount')}
              >
                Amount {sortIcon('requestedAmount')}
              </th>
              <th
                className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort('loanDurationMonths')}
              >
                Duration {sortIcon('loanDurationMonths')}
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Purpose</th>
              <th
                className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort('submissionDate')}
              >
                Submitted {sortIcon('submissionDate')}
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((app) => (
              <React.Fragment key={app.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{app.id.slice(0, 8)}…</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-800">ETB {Number(app.requestedAmount).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-gray-600">{app.loanDurationMonths}mo</td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-[120px] truncate">{app.loanPurpose}</td>
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                    {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    {approveTarget !== app.id && rejectTarget !== app.id && (
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => { setApproveTarget(app.id); setRejectTarget(null); setExpandedId(app.id); }}
                          disabled={approving}
                          className="px-2.5 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setRejectTarget(app.id); setApproveTarget(null); setRejectReason(''); setRejectError(''); setExpandedId(app.id); }}
                          className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>

                {expandedId === app.id && (
                  <tr key={`${app.id}-detail`}>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                      {/* Inline approve confirmation */}
                      {approveTarget === app.id && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                          <p className="text-xs font-semibold text-green-800 mb-2">
                            Confirm approval of ETB {Number(app.requestedAmount).toLocaleString()} for {app.loanDurationMonths} months?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={approving}
                              className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {approving && <CircularProgress size={10} color="inherit" />}
                              {approving ? 'Approving...' : 'Confirm Approve'}
                            </button>
                            <button onClick={() => setApproveTarget(null)} className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-white">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* Inline reject form */}
                      {rejectTarget === app.id && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-xs font-semibold text-red-800 mb-2">Rejection reason</p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                            rows={2}
                            placeholder="Reason for rejection..."
                            className="w-full px-3 py-2 rounded-md border border-red-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none bg-white"
                          />
                          {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleReject(app)} disabled={rejecting} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50">
                              {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                            <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-white">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* Collateral + Documents */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Collateral</p>
                          <CollateralForm applicationId={app.id} memberId={app.memberId} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents</p>
                          <DocumentManager entityType="LOAN_APPLICATION" entityId={app.id} canDelete={true} />
                        </div>
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
    </div>
  );
}
