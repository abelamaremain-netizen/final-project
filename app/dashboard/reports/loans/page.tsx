'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useGetLoanPortfolioReportQuery } from '@/features/reports/reportsApi';
import { RoleGuard } from '@/components/auth/RoleGuard';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e', APPROVED: '#6366f1', DISBURSED: '#06b6d4',
  PAID_OFF: '#8b5cf6', DEFAULTED: '#ef4444', PENDING: '#f59e0b',
};

export default function LoanReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 8) + '01';
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [query, setQuery] = useState({ startDate: firstOfMonth, endDate: today });

  const { data, isLoading, isFetching } = useGetLoanPortfolioReportQuery(query);

  const fmtETB = (n?: number) =>
    `ETB ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtPct = (n?: number) => `${(Number(n ?? 0)).toFixed(2)}%`;

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Loans', data.totalLoans],
      ['Active Loans', data.activeLoans],
      ['Completed Loans', data.completedLoans],
      ['Defaulted Loans', data.defaultedLoans],
      ['Total Disbursed', data.totalDisbursed],
      ['Total Outstanding', data.totalOutstanding],
      ['Total Repaid', data.totalRepaid],
      ['Average Loan Amount', data.averageLoanAmount],
      ['Average Interest Rate', data.averageInterestRate],
      ['Repayment Rate', fmtPct(data.repaymentRate)],
      ['Default Rate', fmtPct(data.defaultRate)],
      ['Delinquent Loans', data.delinquentLoans],
      ['Delinquent Amount', data.delinquentAmount],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `loan-report-${query.startDate}-${query.endDate}.csv`;
    a.click();
  };

  const statusPieData = data?.loansByStatus
    ? Object.entries(data.loansByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const durationBarData = data?.loansByDuration
    ? Object.entries(data.loansByDuration).map(([name, count]) => ({
        name,
        count,
        outstanding: Number(data.outstandingByDuration?.[name] ?? 0),
      }))
    : [];

  const portfolioBar = data ? [
    { name: 'Disbursed', value: Number(data.totalDisbursed ?? 0) },
    { name: 'Outstanding', value: Number(data.totalOutstanding ?? 0) },
    { name: 'Repaid', value: Number(data.totalRepaid ?? 0) },
  ] : [];

  return (
    <RoleGuard allowedRoles={['MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Loan Portfolio Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Loan disbursement, repayment, and performance overview</p>
          </div>
          <button onClick={exportCSV} disabled={!data}
            className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-green-600 transition-colors">
            Export CSV
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <button onClick={() => setQuery({ startDate, endDate })}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Generate
          </button>
        </div>

        {(isLoading || isFetching) ? (
          <div className="flex justify-center py-12"><CircularProgress /></div>
        ) : data ? (
          <div className="space-y-6">

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard label="Total Loans" value={String(data.totalLoans)} sub="All time" color="bg-blue-500" />
              <KpiCard label="Active" value={String(data.activeLoans)} sub="Currently active" color="bg-green-500" />
              <KpiCard label="Completed" value={String(data.completedLoans)} sub="Paid off" color="bg-purple-500" />
              <KpiCard label="Defaulted" value={String(data.defaultedLoans)} sub="In default" color="bg-red-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard label="Total Disbursed" value={fmtETB(data.totalDisbursed)} sub="Principal issued" color="bg-blue-600" />
              <KpiCard label="Outstanding" value={fmtETB(data.totalOutstanding)} sub="Current exposure" color="bg-orange-500" />
              <KpiCard label="Total Repaid" value={fmtETB(data.totalRepaid)} sub="Collected" color="bg-teal-500" />
              <KpiCard label="Avg Loan Amount" value={fmtETB(data.averageLoanAmount)} sub={`Avg rate: ${fmtPct(data.averageInterestRate)}`} color="bg-indigo-500" />
            </div>

            {/* Performance row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Repayment Rate</p>
                <p className="text-2xl font-bold text-green-600">{fmtPct(data.repaymentRate)}</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(Number(data.repaymentRate ?? 0), 100)}%` }} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Default Rate</p>
                <p className="text-2xl font-bold text-red-600">{fmtPct(data.defaultRate)}</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(Number(data.defaultRate ?? 0), 100)}%` }} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Delinquent Loans</p>
                <p className="text-2xl font-bold text-amber-600">{data.delinquentLoans}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtETB(data.delinquentAmount)} at risk</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Status distribution — Pie */}
              {statusPieData.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Loans by Status</h3>
                  <p className="text-xs text-gray-400 mb-4">Distribution of loan statuses</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={90}
                        dataKey="value" nameKey="name"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {statusPieData.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name] ?? COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Portfolio overview — Bar */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Portfolio Overview</h3>
                <p className="text-xs text-gray-400 mb-4">Disbursed vs outstanding vs repaid</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={portfolioBar} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmtETB(Number(v ?? 0))} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {portfolioBar.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Duration breakdown — Bar */}
              {durationBarData.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Loans by Duration</h3>
                  <p className="text-xs text-gray-400 mb-4">Count and outstanding balance by loan term bucket</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={durationBarData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v, name) => name === 'count' ? String(v) : fmtETB(Number(v ?? 0))} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="outstanding" name="Outstanding (ETB)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Status table */}
            {data.loansByStatus && Object.keys(data.loansByStatus).length > 0 && (
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Detail</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500">Status</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500">Count</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(data.loansByStatus).map(([status, count]) => (
                      <tr key={status} className="hover:bg-white/40">
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] ?? '#9ca3af' }} />
                            <span className="text-gray-700">{status.replace(/_/g, ' ')}</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-900">{count}</td>
                        <td className="py-2.5 text-right text-gray-600">{fmtETB(data.outstandingByStatus?.[status])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-200 border-l-4 border-l-slate-400 shadow-sm">
      <p className="text-xs text-gray-500 truncate">{label}</p>
      <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
    </div>
  );
}
