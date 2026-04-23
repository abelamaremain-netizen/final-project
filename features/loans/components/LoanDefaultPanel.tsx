'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  useGetDefaultForLoanQuery,
  useDeclareDefaultMutation,
  useInitiateLegalActionMutation,
  useResolveDefaultMutation,
} from '../loansApi';
import { toastSuccess, toastError } from '@/components/common/Toast';

interface Props {
  loanId: string;
}

export function LoanDefaultPanel({ loanId }: Props) {
  const { data: loanDefault, isLoading, isError, error, refetch } = useGetDefaultForLoanQuery(loanId);
  // Backend returns 404 when no default record exists — treat as "no default" not an error
  const is404 = isError && (error as any)?.status === 404;
  const hasNoDefault = is404 || (!isLoading && !loanDefault);
  const [declareDefault, { isLoading: declaring }] = useDeclareDefaultMutation();
  const [initiateLegal, { isLoading: initiating }] = useInitiateLegalActionMutation();
  const [resolveDefault, { isLoading: resolving }] = useResolveDefaultMutation();

  const [reason, setReason] = useState('');
  const [courtCase, setCourtCase] = useState('');
  const [resolution, setResolution] = useState('');
  const [mode, setMode] = useState<'declare' | 'legal' | 'resolve' | null>(null);

  const handleDeclare = async () => {
    if (!reason.trim()) return;
    try {
      await declareDefault({ id: loanId, reason }).unwrap();
      toastSuccess('Default declared');
      setMode(null); setReason(''); refetch();
    } catch (e: any) { toastError(e?.data?.message ?? 'Failed to declare default'); }
  };

  const handleLegal = async () => {
    if (!courtCase.trim()) return;
    try {
      await initiateLegal({ id: loanId, courtCaseNumber: courtCase }).unwrap();
      toastSuccess('Legal action initiated');
      setMode(null); setCourtCase(''); refetch();
    } catch (e: any) { toastError(e?.data?.message ?? 'Failed to initiate legal action'); }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) return;
    try {
      await resolveDefault({ id: loanId, resolutionNotes: resolution }).unwrap();
      toastSuccess('Default resolved');
      setMode(null); setResolution(''); refetch();
    } catch (e: any) { toastError(e?.data?.message ?? 'Failed to resolve default'); }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-all';

  if (isLoading) return <div className="flex justify-center py-4"><CircularProgress size={20} /></div>;

  // Show a generic error only for non-404 failures
  if (isError && !is404) return (
    <p className="text-sm text-red-500">Failed to load default information.</p>
  );

  const statusColors: Record<string, string> = {
    DEFAULTED: 'bg-red-100 text-red-700',
    LEGAL_ACTION_INITIATED: 'bg-orange-100 text-orange-700',
    IN_COURT: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-4">
      {loanDefault && !hasNoDefault ? (
        <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-red-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Default Record</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[loanDefault.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {loanDefault.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-600"><span className="font-medium">Reason:</span> {loanDefault.reason}</p>
          {loanDefault.courtCaseNumber && (
            <p className="text-xs text-gray-600"><span className="font-medium">Court Case:</span> {loanDefault.courtCaseNumber}</p>
          )}
          {loanDefault.resolutionNotes && (
            <p className="text-xs text-gray-600"><span className="font-medium">Resolution:</span> {loanDefault.resolutionNotes}</p>
          )}
          <p className="text-xs text-gray-400">Declared: {new Date(loanDefault.declaredAt).toLocaleDateString()}</p>

          {loanDefault.status === 'DEFAULTED' && mode !== 'legal' && (
            <button onClick={() => setMode('legal')} className="text-xs text-orange-600 hover:underline">
              Initiate Legal Action
            </button>
          )}
          {loanDefault.status !== 'RESOLVED' && mode !== 'resolve' && (
            <button onClick={() => setMode('resolve')} className="ml-4 text-xs text-green-600 hover:underline">
              Resolve Default
            </button>
          )}

          {mode === 'legal' && (
            <div className="space-y-2 pt-2 border-t border-white/40">
              <input value={courtCase} onChange={(e) => setCourtCase(e.target.value)} placeholder="Court case number" className={inputCls} />
              <div className="flex gap-2">
                <button onClick={handleLegal} disabled={initiating} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold disabled:opacity-60">
                  {initiating ? <CircularProgress size={14} color="inherit" /> : 'Confirm'}
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
              </div>
            </div>
          )}

          {mode === 'resolve' && (
            <div className="space-y-2 pt-2 border-t border-white/40">
              <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2} placeholder="Resolution notes" className={inputCls} />
              <div className="flex gap-2">
                <button onClick={handleResolve} disabled={resolving} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-60">
                  {resolving ? <CircularProgress size={14} color="inherit" /> : 'Resolve'}
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">No default record for this loan.</p>
          {mode !== 'declare' ? (
            <button onClick={() => setMode('declare')} className="text-xs text-red-600 hover:underline font-medium">
              Declare Default
            </button>
          ) : (
            <div className="space-y-2">
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for default..." className={inputCls} />
              <div className="flex gap-2">
                <button onClick={handleDeclare} disabled={declaring} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold disabled:opacity-60">
                  {declaring ? <CircularProgress size={14} color="inherit" /> : 'Declare Default'}
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
