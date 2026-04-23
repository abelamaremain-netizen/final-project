'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useGetFinancialReportQuery } from '@/features/reports/reportsApi';
import { RoleGuard } from '@/components/auth/RoleGuard';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function FinancialReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 8) + '01';
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [query, setQuery] = useState({ startDate: firstOfMonth, endDate: today });

  const { data, isLoading, isFetching } = useGetFinancialReportQuery(query);

  const fmtETB = (n?: number) =>
    `ETB ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (n?: number) => `${((n ?? 0) * 100).toFixed(2)}%`;

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Regular Savings', data.totalRegularSavings],
      ['Total Non-Regular Savings', data.totalNonRegularSavings],
      ['Total Savings', data.totalSavings],
      ['Total Share Capital', data.totalShareCapital],
      ['Total Shares', data.totalShares],
      ['Loans Disbursed', data.totalLoansDisbursed],
      ['Outstanding Loans', data.totalOutstandingLoans],
      ['Total Repayments', data.totalLoanRepayments],
      ['Active Loans', data.activeLoanCount],
      ['Interest Earned', data.totalInterestEarned],
      ['Interest Paid', data.totalInterestPaid],
      ['Available Liquidity', data.availableLiquidity],
      ['Liquidity Ratio', pct(data.liquidityRatio)],
      ['Compliance Status', data.complianceStatus],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `financial-report-${query.startDate}-${query.endDate}.csv`;
    a.click();
  };

  // Chart data
  const savingsBreakdown = data ? [
    { name: 'Regular Savings', value: Number(data.totalRegularSavings ?? 0) },
    { name: 'Non-Regular Savings', value: Number(data.totalNonRegularSavings ?? 0) },
    { name: 'Share Capital', value: Number(data.totalShareCapital ?? 0) },
  ] : [];

  const loanBreakdown = data ? [
    { name: 'Disbursed', value: Number(data.totalLoansDisbursed ?? 0) },
    { name: 'Outstanding', value: Number(data.totalOutstandingLoans ?? 0) },
    { name: 'Repaid', value: Number(data.totalLoanRepayments ?? 0) },
  ] : [];

  const interestBreakdown = data ? [
    { name: 'Interest Earned', value: Number(data.totalInterestEarned ?? 0) },
    { name: 'Interest Paid', value: Number(data.totalInterestPaid ?? 0) },
  ] : [];

  return (
    <RoleGuard allowedRoles={['MANAGER', 'ACCOUNTANT', 'AUDITOR']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Financial Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Cooperative financial position and performance overview</p>
          </div>
          <button onClick={exportCSV} disabled={!data}
            className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-green-600 transition-colors">
            Export CSV
          </button>
        </div>

        {/* Date filter */}
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

            {/* Compliance banner */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              data.withinLendingLimit
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`w-3 h-3 rounded-full ${data.withinLendingLimit ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className={`text-sm font-semibold ${data.withinLendingLimit ? 'text-green-800' : 'text-red-800'}`}>
                  {data.withinLendingLimit ? 'Compliant — Within Lending Limit' : 'Non-Compliant — Exceeds Lending Limit'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lending limit: {pct(data.lendingLimitPercentage)} of total assets &nbsp;·&nbsp;
                  Remaining capacity: {fmtETB(data.remainingLendingCapacity)} &nbsp;·&nbsp;
                  Liquidity ratio: {pct(data.liquidityRatio)}
                </p>
              </div>
            </div>

            {/* KPI cards */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Key Metrics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <KpiCard label="Total Savings" value={fmtETB(data.totalSavings)} sub="Regular + Non-Regular" color="bg-green-500" />
                <KpiCard label="Share Capital" value={fmtETB(data.totalShareCapital)} sub={`${data.totalShares} shares`} color="bg-purple-500" />
                <KpiCard label="Loans Disbursed" value={fmtETB(data.totalLoansDisbursed)} sub={`${data.activeLoanCount} active loans`} color="bg-blue-500" />
                <KpiCard label="Outstanding Loans" value={fmtETB(data.totalOutstandingLoans)} sub="Current exposure" color="bg-orange-500" />
                <KpiCard label="Total Repayments" value={fmtETB(data.totalLoanRepayments)} sub="Collected to date" color="bg-indigo-500" />
                <KpiCard label="Interest Earned" value={fmtETB(data.totalInterestEarned)} sub="From savings" color="bg-teal-500" />
                <KpiCard label="Interest Paid" value={fmtETB(data.totalInterestPaid)} sub="On loans" color="bg-rose-500" />
                <KpiCard label="Available Liquidity" value={fmtETB(data.availableLiquidity)} sub={`Ratio: ${pct(data.liquidityRatio)}`} color={data.availableLiquidity >= 0 ? 'bg-green-600' : 'bg-red-600'} />
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Savings & Capital breakdown — Pie */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Asset Composition</h3>
                <p className="text-xs text-gray-400 mb-4">Breakdown of savings and share capital</p>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={savingsBreakdown} cx="50%" cy="50%" outerRadius={90}
                      dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {savingsBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtETB(Number(v ?? 0))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Loan portfolio — Bar */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Loan Portfolio</h3>
                <p className="text-xs text-gray-400 mb-4">Disbursed vs outstanding vs repaid</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={loanBreakdown} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmtETB(Number(v ?? 0))} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {loanBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Interest — Bar */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Interest Summary</h3>
                <p className="text-xs text-gray-400 mb-4">Interest earned vs interest paid on loans</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={interestBreakdown} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmtETB(Number(v ?? 0))} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Liquidity gauge — simple visual */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Liquidity & Lending Capacity</h3>
                <p className="text-xs text-gray-400 mb-4">How much of the lending limit is utilized</p>
                <div className="space-y-4 mt-2">
                  {[
                    {
                      label: 'Lending Utilization',
                      used: Number(data.totalOutstandingLoans ?? 0),
                      total: Number(data.totalOutstandingLoans ?? 0) + Number(data.remainingLendingCapacity ?? 0),
                      color: data.withinLendingLimit ? 'bg-blue-500' : 'bg-red-500',
                    },
                    {
                      label: 'Liquidity Ratio',
                      used: Number(data.liquidityRatio ?? 0) * 100,
                      total: 100,
                      color: 'bg-green-500',
                    },
                  ].map(({ label, used, total, color }) => {
                    const pctVal = total > 0 ? Math.min((used / total) * 100, 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="font-medium">{label}</span>
                          <span>{pctVal.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pctVal}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-gray-500">Remaining Capacity</p>
                      <p className="font-bold text-blue-700 mt-0.5">{fmtETB(data.remainingLendingCapacity)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-gray-500">Available Liquidity</p>
                      <p className="font-bold text-green-700 mt-0.5">{fmtETB(data.availableLiquidity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings detail table */}
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Savings Detail</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Category</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">Amount</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { label: 'Regular Savings', value: data.totalRegularSavings },
                    { label: 'Non-Regular Savings', value: data.totalNonRegularSavings },
                    { label: 'Share Capital', value: data.totalShareCapital },
                  ].map(({ label, value }) => {
                    const total = (data.totalSavings ?? 0) + (data.totalShareCapital ?? 0);
                    const share = total > 0 ? ((Number(value ?? 0) / total) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={label} className="hover:bg-white/40">
                        <td className="py-2.5 text-gray-700">{label}</td>
                        <td className="py-2.5 text-right font-semibold text-gray-900">{fmtETB(value)}</td>
                        <td className="py-2.5 text-right text-gray-500">{share}%</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-gray-300 font-bold">
                    <td className="py-2.5 text-gray-900">Total Assets</td>
                    <td className="py-2.5 text-right text-gray-900">{fmtETB((data.totalSavings ?? 0) + (data.totalShareCapital ?? 0))}</td>
                    <td className="py-2.5 text-right text-gray-500">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm border-l-4 border-l-slate-400">
      <p className="text-xs text-gray-500 truncate">{label}</p>
      <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
    </div>
  );
}
