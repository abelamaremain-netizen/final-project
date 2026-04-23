'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import { useGetApplicationByIdQuery, useGetAppealsForApplicationQuery } from '@/features/loans/loansApi';
import { CollateralForm } from '@/features/collateral/components/CollateralForm';
import { LoanAppealForm } from '@/features/loans/components/LoanAppealForm';
import { DocumentManager } from '@/features/documents/components/DocumentManager';

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  DENIED: 'bg-red-100 text-red-700',
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: app, isLoading } = useGetApplicationByIdQuery(id);
  const { data: appeals = [] } = useGetAppealsForApplicationQuery(id);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64"><CircularProgress /></div>
  );
  if (!app) return (
    <div className="text-center py-16 text-gray-500">Application not found</div>
  );

  const isDenied = (app.status as string) === 'DENIED';
  const hasActiveAppeal = appeals.some(a => a.status === 'PENDING');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-2 block">
          &larr; Back
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Application #{app.id.slice(0, 8)}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status as string] ?? 'bg-gray-100 text-gray-600'}`}>
            {app.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Application Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ['Requested Amount', `ETB ${Number(app.requestedAmount).toLocaleString()}`],
            ['Duration', `${app.loanDurationMonths} months`],
            ['Purpose', app.loanPurpose],
            ['Submitted', app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '—'],
            ['Reviewed By', (app as any).reviewedBy ?? '—'],
            ['Member ID', app.memberId?.slice(0, 8) + '…'],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>
        {isDenied && (app as any).denialReason && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-1">Denial Reason</p>
            <p className="text-sm text-red-600">{(app as any).denialReason}</p>
          </div>
        )}
      </div>

      {/* Collateral */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Collateral</h2>
        <CollateralForm applicationId={app.id} readonly={isDenied} />
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Documents</h2>
        <DocumentManager entityType="LOAN_APPLICATION" entityId={app.id} canDelete={!isDenied} />
      </div>

      {/* Appeals */}
      {isDenied && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Appeals</h2>

          {appeals.length > 0 && (
            <div className="space-y-2">
              {appeals.map(a => (
                <div key={a.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{new Date(a.submissionDate).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      a.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      a.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{a.status}</span>
                  </div>
                  <p className="text-gray-700">{a.appealReason}</p>
                  {a.decisionNotes && (
                    <p className="text-xs text-gray-500 mt-1">Decision: {a.decisionNotes}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!hasActiveAppeal && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Submit a new appeal for this application.</p>
              <LoanAppealForm applicationId={app.id} memberId={app.memberId} />
            </div>
          )}

          {hasActiveAppeal && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              An appeal is already pending review.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
