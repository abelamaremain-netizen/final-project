'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { useGetMembershipReportQuery } from '@/features/reports/reportsApi';
import { RoleGuard } from '@/components/auth/RoleGuard';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e', SUSPENDED: '#f59e0b', WITHDRAWN: '#ef4444',
  INACTIVE: '#9ca3af', DECEASED: '#6b7280',
};

export default function MembershipReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 8) + '01';
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [query, setQuery] = useState({ startDate: firstOfMonth, endDate: today });

  const { data, isLoading, isFetching } = useGetMembershipReportQuery(query);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Members', data.totalMembers],
      ['Active Members', data.activeMembers],
      ['Suspended Members', data.suspendedMembers],
      ['Withdrawn Members', data.withdrawnMembers],
      ['New This Month', data.newMembersThisMonth],
      ['New This Year', data.newMembersThisYear],
      ['Total Suspensions', data.totalSuspensions],
      ['Active Suspensions', data.activeSuspensions],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `membership-report-${query.startDate}-${query.endDate}.csv`;
    a.click();
  };

  // Chart data
  const statusPieData = data?.membersByStatus
    ? Object.entries(data.membersByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const growthLineData = data?.memberGrowthByMonth
    ? Object.entries(data.memberGrowthByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month: month.slice(5), count }))
    : [];

  const terminationBar = data ? [
    { name: 'Voluntary', value: data.voluntaryWithdrawals ?? 0 },
    { name: 'Involuntary', value: data.involuntaryTerminations ?? 0 },
    { name: 'Death', value: data.deathExits ?? 0 },
  ] : [];

  return (
    <RoleGuard allowedRoles={['MANAGER', 'MEMBER_OFFICER', 'AUDITOR']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Membership Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Member composition, growth, and activity overview</p>
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
              <KpiCard label="Total Members" value={String(data.totalMembers)} sub="All registered" color="bg-blue-500" />
              <KpiCard label="Active" value={String(data.activeMembers)} sub="Currently active" color="bg-green-500" />
              <KpiCard label="Suspended" value={String(data.suspendedMembers)} sub="Under suspension" color="bg-amber-500" />
              <KpiCard label="Withdrawn" value={String(data.withdrawnMembers)} sub="Left cooperative" color="bg-red-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard label="New This Month" value={String(data.newMembersThisMonth)} sub="Registered this month" color="bg-teal-500" />
              <KpiCard label="New This Year" value={String(data.newMembersThisYear)} sub="Registered this year" color="bg-indigo-500" />
              <KpiCard label="Total Suspensions" value={String(data.totalSuspensions)} sub="All time" color="bg-orange-500" />
              <KpiCard label="Active Suspensions" value={String(data.activeSuspensions)} sub="Currently suspended" color="bg-rose-500" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Status distribution — Pie */}
              {statusPieData.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Members by Status</h3>
                  <p className="text-xs text-gray-400 mb-4">Current membership status distribution</p>
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

              {/* Growth trend — Line */}
              {growthLineData.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Member Growth (Last 12 Months)</h3>
                  <p className="text-xs text-gray-400 mb-4">New registrations per month</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={growthLineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" name="New Members" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Termination breakdown — Bar */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Exit Reasons</h3>
                <p className="text-xs text-gray-400 mb-4">How members have left the cooperative</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={terminationBar} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#6b7280" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Suspension reasons */}
              {data.suspensionsByReason && Object.keys(data.suspensionsByReason).length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Suspension Reasons</h3>
                  <p className="text-xs text-gray-400 mb-4">Why members have been suspended</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={Object.entries(data.suspensionsByReason).map(([name, value]) => ({ name: name.slice(0, 20), value }))}
                      layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                      <Tooltip />
                      <Bar dataKey="value" name="Count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Status detail table */}
            {statusPieData.length > 0 && (
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Detail</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-semibold text-gray-500">Status</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500">Count</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {statusPieData.map(({ name, value }) => (
                      <tr key={name} className="hover:bg-white/40">
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[name] ?? '#9ca3af' }} />
                            <span className="text-gray-700">{name}</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-900">{value}</td>
                        <td className="py-2.5 text-right text-gray-500">
                          {data.totalMembers > 0 ? ((value / data.totalMembers) * 100).toFixed(1) : '0.0'}%
                        </td>
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
