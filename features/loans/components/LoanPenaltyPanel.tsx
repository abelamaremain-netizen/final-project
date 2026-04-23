'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetLoanPenaltiesQuery, useGetTotalUnpaidPenaltiesQuery, useAssessPenaltyMutation } from '../loansApi';
import { toastSuccess, toastError } from '@/components/common/Toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { LoanPenalty } from '@/types';

interface Props {
  loanId: string;
  loanStatus?: string;
}

export function LoanPenaltyPanel({ loanId, loanStatus }: Props) {
  const { data: penalties = [], isLoading, refetch } = useGetLoanPenaltiesQuery(loanId);
  const { data: totalUnpaid } = useGetTotalUnpaidPenaltiesQuery(loanId);
  const [assessPenalty, { isLoading: assessing }] = useAssessPenaltyMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const canAssess = loanStatus === 'ACTIVE' || loanStatus === 'DISBURSED';

  const handleAssess = async () => {
    try {
      await assessPenalty(loanId).unwrap();
      toastSuccess('Penalty assessed');
      setShowConfirm(false);
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to assess penalty');
      setShowConfirm(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-4"><CircularProgress size={20} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total Unpaid Penalties</p>
          <p className="text-lg font-bold text-red-600">
            ETB {(totalUnpaid ?? 0).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={assessing || !canAssess}
          title={!canAssess ? `Penalties can only be assessed on active loans (current status: ${loanStatus})` : undefined}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold shadow hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {assessing ? <CircularProgress size={12} color="inherit" /> : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          Assess Penalty
        </button>
      </div>

      {!canAssess && loanStatus && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Penalty assessment is only available for loans with status <span className="font-semibold">ACTIVE</span> or <span className="font-semibold">DISBURSED</span>. This loan is <span className="font-semibold">{loanStatus}</span>.
        </p>
      )}

      {penalties.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No penalties recorded.</p>
      ) : (
        <div className="space-y-2">
          {penalties.map((p: LoanPenalty) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40">
              <div>
                <p className="text-sm font-medium text-gray-700">ETB {p.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{p.reason}</p>
                <p className="text-xs text-gray-400">{new Date(p.assessedAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {p.paid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          ))}
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          title="Assess Late Payment Penalty"
          message="This will calculate and record a late payment penalty for this loan based on the current configuration. Proceed?"
          confirmLabel="Assess Penalty"
          variant="warning"
          isLoading={assessing}
          onConfirm={handleAssess}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
