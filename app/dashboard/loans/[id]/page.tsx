'use client';

import { use, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetLoanByIdQuery, useGetRepaymentHistoryQuery, useGetApplicationByIdQuery } from '@/features/loans/loansApi';
import { LoanRepaymentForm } from '@/features/loans/components/LoanRepaymentForm';
import { LoanPenaltyPanel } from '@/features/loans/components/LoanPenaltyPanel';
import { LoanDefaultPanel } from '@/features/loans/components/LoanDefaultPanel';
import { LoanAppealForm } from '@/features/loans/components/LoanAppealForm';
import { LoanRestructuringForm } from '@/features/loans/components/LoanRestructuringForm';
import { DocumentManager } from '@/features/documents/components/DocumentManager';
import { CollateralForm } from '@/features/collateral/components/CollateralForm';
import { LoanStatus, LoanRepayment } from '@/types';

const statusColors: Record<string, string> = {
  [LoanStatus.ACTIVE]: 'bg-green-100 text-green-700',
  [LoanStatus.PAID_OFF]: 'bg-blue-100 text-blue-700',
  [LoanStatus.DEFAULTED]: 'bg-red-100 text-red-700',
  [LoanStatus.DISBURSED]: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-amber-100 text-amber-700',
};

type Tab = 'repayment' | 'collateral' | 'penalties' | 'default' | 'restructuring' | 'appeal' | 'documents';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: loan, isLoading } = useGetLoanByIdQuery(id);
  const { data: repayments } = useGetRepaymentHistoryQuery(id);
  // Fetch the linked application to check if it was denied (for appeal eligibility)
  const { data: application } = useGetApplicationByIdQuery(loan?.applicationId ?? '', {
    skip: !loan?.applicationId,
  });
  const [activeTab, setActiveTab] = useState<Tab>('repayment');

  if (isLoading) return (
    <div className="flex justify-center items-center h-64"><CircularProgress /></div>
  );
  if (!loan) return (
    <div className="text-center py-16 text-gray-500">Loan not found</div>
  );

  const principal = typeof loan.principalAmount === 'object' ? (loan.principalAmount as any).amount : loan.principalAmount;
  const outstanding = typeof loan.outstandingPrincipal === 'object' ? (loan.outstandingPrincipal as any).amount : loan.outstandingPrincipal;
  const totalPaidRaw = repayments?.reduce((sum, r) => sum + Number(r.paymentAmount ?? 0), 0) ?? 0;
  const isActive = ['ACTIVE', 'DISBURSED'].includes(loan.status as string);
  const isDenied = (application?.status as string) === 'DENIED';
  const canRestructure = isActive;

  const interestRate = Number(loan.interestRate ?? 0);
  const months = Number(loan.durationMonths ?? 1);
  const principalNum = Number(principal ?? 0);
  const totalInterest = principalNum * interestRate * (months / 12);
  const monthlyPrincipal = principalNum / months;
  const monthlyInterest = totalInterest / months;
  const monthlyTotal = monthlyPrincipal + monthlyInterest;

  // Build tabs dynamically based on loan state
  const tabs: { id: Tab; label: string }[] = [
    { id: 'repayment', label: 'Repayments' },
    { id: 'collateral', label: 'Collateral' },
    { id: 'documents', label: 'Documents' },
    ...(isActive ? [{ id: 'penalties' as Tab, label: 'Penalties' }] : []),
    ...(isActive || loan.status === 'DEFAULTED' ? [{ id: 'default' as Tab, label: 'Default' }] : []),
    ...(canRestructure ? [{ id: 'restructuring' as Tab, label: 'Restructuring' }] : []),
    ...(isDenied ? [{ id: 'appeal' as Tab, label: 'Appeal' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Loan #{loan.id.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500 mt-1">Application: {loan.applicationId?.slice(0, 8)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[loan.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {loan.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Principal', value: `ETB ${Number(principal).toLocaleString()}` },
            { label: 'Interest Rate', value: `${(Number(loan.interestRate) * 100).toFixed(1)}% p.a.` },
            { label: 'Duration', value: `${loan.durationMonths} months` },
            { label: 'Outstanding', value: `ETB ${Number(outstanding).toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-white/50 border border-white/30">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Monthly breakdown */}
        

        {loan.disbursementDate && (
          <p className="text-xs text-gray-500 mt-4">
            Disbursed: {new Date(loan.disbursementDate).toLocaleDateString()}
            {loan.maturityDate && ` · Matures: ${new Date(loan.maturityDate).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/40 backdrop-blur-xl border border-white/20 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-lg">
        {activeTab === 'repayment' && (
          <div className="space-y-6">
            {/* Loan calculation summary */}
            {months > 0 && principalNum > 0 && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/40 space-y-3">
                <p className="text-xs font-semibold text-blue-700">Loan Summary</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-white/60">
                    <p className="text-gray-500">Total Interest</p>
                    <p className="font-bold text-orange-600">ETB {totalInterest.toFixed(2)}</p>
                    <p className="text-gray-400 mt-0.5">{principalNum.toLocaleString()} × {(interestRate * 100).toFixed(1)}% × {(months/12).toFixed(2)} yrs</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/60">
                    <p className="text-gray-500">Total Payable</p>
                    <p className="font-bold text-gray-800">ETB {(principalNum + totalInterest).toFixed(2)}</p>
                    <p className="text-gray-400 mt-0.5">Principal + Interest</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/60">
                    <p className="text-gray-500">Monthly Installment</p>
                    <p className="font-bold text-blue-700">ETB {monthlyTotal.toFixed(2)}</p>
                    <p className="text-gray-400 mt-0.5">{monthlyPrincipal.toFixed(2)} + {monthlyInterest.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/60">
                    <p className="text-gray-500">Payments Made</p>
                    <p className="font-bold text-green-600">ETB {Number(totalPaidRaw ?? 0).toLocaleString()}</p>
                    <p className="text-gray-400 mt-0.5">of ETB {(principalNum + totalInterest).toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Repayment Progress</span>
                    <span>{Math.min(100, ((Number(totalPaidRaw ?? 0) / (principalNum + totalInterest)) * 100)).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                      style={{ width: `${Math.min(100, (Number(totalPaidRaw ?? 0) / (principalNum + totalInterest)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {isActive && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-1">Record Repayment</h2>
                <p className="text-xs text-gray-500 mb-4">
                  Suggested monthly payment: <span className="font-semibold text-blue-700">ETB {monthlyTotal.toFixed(2)}</span>
                  {' '}(ETB {monthlyPrincipal.toFixed(2)} principal + ETB {monthlyInterest.toFixed(2)} interest)
                </p>
                <LoanRepaymentForm loanId={loan.id} suggestedAmount={monthlyTotal} />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4">Repayment History</h2>
              {!repayments || repayments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No repayments recorded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/40">
                        <th className="text-left py-2 px-2 font-semibold text-gray-600">Date</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-600">Amount</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-600">Principal</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-600">Interest</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-600">By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {repayments.map((r: LoanRepayment) => (
                          <tr key={r.id} className="hover:bg-white/30">
                            <td className="py-2 px-2 text-gray-700">{new Date(r.paymentDate).toLocaleDateString()}</td>
                            <td className="py-2 px-2 text-right font-medium text-gray-800">ETB {Number(r.paymentAmount).toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-blue-700">ETB {Number(r.principalPaid).toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-orange-600">ETB {Number(r.interestPaid).toLocaleString()}</td>
                            <td className="py-2 px-2 text-gray-500 truncate max-w-[80px]">{r.processedBy}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'collateral' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">Collateral</h2>
            {/* loanId-linked collateral (post-approval, including restructured loans) */}
            <CollateralForm loanId={loan.id} readonly={loan.status === 'PAID_OFF' || loan.status === 'DEFAULTED'} />
            {/* Also show application-phase collateral in case it wasn't re-linked (e.g. restructured loans) */}
            {loan.applicationId && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-3">Collateral pledged during application</p>
                <CollateralForm applicationId={loan.applicationId} readonly={true} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'penalties' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">Loan Penalties</h2>
            <LoanPenaltyPanel loanId={loan.id} loanStatus={loan.status as string} />
          </div>
        )}

        {activeTab === 'default' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">Default Management</h2>
            <LoanDefaultPanel loanId={loan.id} />
          </div>
        )}

        {activeTab === 'restructuring' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">Loan Restructuring</h2>
            {canRestructure ? (
              <LoanRestructuringForm loanId={loan.id} />
            ) : (
              <p className="text-sm text-gray-500">Restructuring is only available for active loans.</p>
            )}
          </div>
        )}

        {activeTab === 'appeal' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">Loan Appeal</h2>
            {loan.applicationId ? (
              <LoanAppealForm applicationId={loan.applicationId} memberId={loan.memberId} />
            ) : (
              <p className="text-sm text-gray-500">No application linked to this loan.</p>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4">Loan Documents</h2>
            <DocumentManager entityType="LOAN" entityId={loan.id} canDelete={true} />
          </div>
        )}
      </div>
    </div>
  );
}
