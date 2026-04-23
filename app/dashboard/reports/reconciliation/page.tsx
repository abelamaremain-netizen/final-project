'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useReconcileDeductionsMutation, type ReconciliationReport } from '@/features/payroll/payrollApi';
import { RoleGuard } from '@/components/auth/RoleGuard';

function toYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function ReconciliationReportPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [reconcile, { isLoading }] = useReconcileDeductionsMutation();

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const handleReconcile = async () => {
    const result = await reconcile(toYearMonth(selectedYear, selectedMonth)).unwrap();
    setReport(result);
    setShowConfirm(false);
  };

  return (
    <RoleGuard allowedRoles={['MANAGER', 'ACCOUNTANT', 'AUDITOR']}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Reconciliation Report</h1>

        {/* Period selector */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Select Period</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(Number(e.target.value)); setReport(null); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setReport(null); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              Run Reconciliation
            </button>
          </div>
        </div>

        {/* Report result */}
        {isLoading && (
          <div className="flex justify-center py-12"><CircularProgress /></div>
        )}

        {report && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-800">
                Reconciliation — {String(report.month)}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Expected Deductions', value: report.expectedDeductions },
                  { label: 'Confirmed', value: report.confirmedDeductions },
                  { label: 'Failed', value: report.failedDeductions },
                  { label: 'Discrepancy Amount', value: `ETB ${Number(report.discrepancyAmount).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-lg font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Total Expected</p>
                  <p className="text-lg font-bold text-gray-800">ETB {Number(report.totalExpected).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Total Confirmed</p>
                  <p className="text-lg font-bold text-gray-800">ETB {Number(report.totalConfirmed).toLocaleString()}</p>
                </div>
              </div>
              {report.reconciledBy && (
                <p className="text-xs text-gray-500">
                  Reconciled by {report.reconciledBy} on {new Date(report.reconciliationDate).toLocaleString()}
                </p>
              )}
            </div>

            {report.discrepancies?.length > 0 && (
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Discrepancies ({report.discrepancies.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Member</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Expected</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Confirmed</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Difference</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.discrepancies.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{d.memberName}</td>
                          <td className="px-4 py-2 text-right text-gray-700">ETB {Number(d.expectedAmount).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-gray-700">ETB {Number(d.confirmedAmount).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-red-600">ETB {Number(d.difference).toLocaleString()}</td>
                          <td className="px-4 py-2 text-gray-500">{d.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!report.discrepancies || report.discrepancies.length === 0) && (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                <p className="text-sm font-semibold text-green-700">No discrepancies found. All deductions reconciled successfully.</p>
              </div>
            )}
          </div>
        )}

        {/* Confirm dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Confirm Reconciliation</h3>
              <p className="text-sm text-gray-600 mb-5">
                Run reconciliation for <strong>{months[selectedMonth - 1]} {selectedYear}</strong>?
                This will process all confirmations and generate a discrepancy report.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReconcile}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {isLoading ? 'Running...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
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
