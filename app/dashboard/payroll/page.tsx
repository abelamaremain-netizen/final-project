'use client';

import { useState } from 'react';
import {
  useGenerateDeductionListMutation,
  useGetDeductionListQuery,
  useProcessConfirmationMutation,
  useReconcileDeductionsMutation,
  type ReconciliationReport,
} from '@/features/payroll/payrollApi';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { exportToCsv } from '@/lib/exportCsv';

function toYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-green-100 text-green-700 border border-green-200',
  FAILED: 'bg-red-100 text-red-700 border border-red-200',
};

export default function PayrollPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [reconcileResult, setReconcileResult] = useState<ReconciliationReport | null>(null);
  const [showReconcileConfirm, setShowReconcileConfirm] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmAmounts, setConfirmAmounts] = useState<Record<string, string>>({});

  const selectedPeriod = toYearMonth(selectedYear, selectedMonth);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const { data: deductionList = [], isLoading: listLoading, refetch: refetchList } =
    useGetDeductionListQuery(selectedPeriod);
  const [generateList, { isLoading: generating }] = useGenerateDeductionListMutation();
  const [processConfirmation] = useProcessConfirmationMutation();
  const [reconcile, { isLoading: reconciling }] = useReconcileDeductionsMutation();

  const handleGenerate = async () => {
    try { await generateList(selectedPeriod).unwrap(); refetchList(); } catch {}
  };

  const handleConfirm = async (d: any) => {
    const amount = parseFloat(confirmAmounts[d.id] ?? String(d.deductionAmount ?? 0));
    if (!amount || isNaN(amount)) return;
    setConfirmingId(d.id);
    try {
      await processConfirmation({ memberId: d.memberId, deductionMonth: selectedPeriod, amount }).unwrap();
      refetchList();
    } catch {}
    setConfirmingId(null);
  };

  const handleReconcile = async () => {
    try {
      const result = await reconcile(selectedPeriod).unwrap();
      setReconcileResult(result);
      setShowReconcileConfirm(false);
    } catch {}
  };

  return (
    <RoleGuard allowedRoles={['MANAGER', 'ACCOUNTANT']}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Deductions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate and reconcile monthly salary deductions</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Payroll Processing</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleGenerate} disabled={generating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {generating ? 'Generating...' : 'Generate List'}
              </button>
              <button onClick={() => setShowReconcileConfirm(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                Reconcile
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Deductions - {MONTHS[selectedMonth - 1]} {selectedYear}
            </h2>
            <div className="flex items-center gap-3">
              {(deductionList as any[]).length > 0 && (
                <>
                  <span className="text-xs text-gray-400">{(deductionList as any[]).length} records</span>
                  <button
                    onClick={() => exportToCsv(
                      deductionList as unknown as Record<string, unknown>[],
                      `payroll_${selectedPeriod}`,
                      [
                        { key: 'id', label: 'ID' },
                        { key: 'memberId', label: 'Member ID' },
                        { key: 'memberName', label: 'Member Name' },
                        { key: 'deductionAmount', label: 'Expected Amount' },
                        { key: 'confirmedAmount', label: 'Confirmed Amount' },
                        { key: 'deductionMonth', label: 'Month' },
                        { key: 'status', label: 'Status' },
                      ]
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                </>
              )}
            </div>
          </div>
          {listLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            </div>
          ) : (deductionList as any[]).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Member</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600">Expected</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Month</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(deductionList as any[]).map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{d.memberName ?? d.memberId}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        ETB {Number(d.deductionAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{d.deductionMonth ?? selectedPeriod}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {d.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <input type="number"
                              placeholder={String(d.deductionAmount ?? '')}
                              value={confirmAmounts[d.id] ?? ''}
                              onChange={(e) => setConfirmAmounts(prev => ({ ...prev, [d.id]: e.target.value }))}
                              className="w-24 px-2 py-1 rounded border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <button onClick={() => handleConfirm(d)} disabled={confirmingId === d.id}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50">
                              {confirmingId === d.id ? '...' : 'Confirm'}
                            </button>
                          </div>
                        )}
                        {d.status === 'CONFIRMED' && (
                          <span className="text-xs text-gray-400">
                            ETB {Number(d.confirmedAmount ?? 0).toLocaleString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 text-sm">
              No deduction list for {MONTHS[selectedMonth - 1]} {selectedYear}. Click Generate List to create one.
            </div>
          )}
        </div>

        {reconcileResult && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Reconciliation - {String(reconcileResult.month)}</h2>
              <button onClick={() => setReconcileResult(null)} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Expected', value: reconcileResult.expectedDeductions, color: 'text-gray-900' },
                { label: 'Confirmed', value: reconcileResult.confirmedDeductions, color: 'text-green-600' },
                { label: 'Failed', value: reconcileResult.failedDeductions, color: 'text-red-600' },
                { label: 'Discrepancy', value: `ETB ${Number(reconcileResult.discrepancyAmount).toLocaleString()}`, color: 'text-orange-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReconcileConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Confirm Reconciliation</h3>
              <p className="text-sm text-gray-600 mb-5">
                Reconcile deductions for <strong>{MONTHS[selectedMonth - 1]} {selectedYear}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={handleReconcile} disabled={reconciling}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                  {reconciling ? 'Reconciling...' : 'Confirm'}
                </button>
                <button onClick={() => setShowReconcileConfirm(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
