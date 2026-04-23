'use client';

import Link from 'next/link';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useGetFinancialReportQuery, useGetLoanPortfolioReportQuery, useGetMembershipReportQuery } from '@/features/reports/reportsApi';

const today = new Date().toISOString().split('T')[0];
const firstOfYear = `${new Date().getFullYear()}-01-01`;
const query = { startDate: firstOfYear, endDate: today };

export default function ReportsIndexPage() {
  const { data: fin } = useGetFinancialReportQuery(query);
  const { data: loans } = useGetLoanPortfolioReportQuery(query);
  const { data: members } = useGetMembershipReportQuery(query);

  const fmtETB = (n?: number) =>
    n != null ? `ETB ${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—';
  const fmtNum = (n?: number) => n != null ? String(n) : '—';
  const fmtPct = (n?: number) => n != null ? `${Number(n).toFixed(1)}%` : '—';

  const reports = [
    {
      label: 'Financial Report',
      href: '/dashboard/reports/financial',
      desc: 'Savings, share capital, loans, liquidity and compliance',
      stats: fin ? [
        { label: 'Total Savings', value: fmtETB(fin.totalSavings) },
        { label: 'Share Capital', value: fmtETB(fin.totalShareCapital) },
        { label: 'Outstanding Loans', value: fmtETB(fin.totalOutstandingLoans) },
        { label: 'Status', value: fin.complianceStatus ?? '—' },
      ] : null,
    },
    {
      label: 'Loan Portfolio',
      href: '/dashboard/reports/loans',
      desc: 'Loan disbursements, repayments, defaults and performance',
      stats: loans ? [
        { label: 'Total Loans', value: fmtNum(loans.totalLoans) },
        { label: 'Active', value: fmtNum(loans.activeLoans) },
        { label: 'Total Disbursed', value: fmtETB(loans.totalDisbursed) },
        { label: 'Default Rate', value: fmtPct(loans.defaultRate) },
      ] : null,
    },
    {
      label: 'Membership Report',
      href: '/dashboard/reports/membership',
      desc: 'Member statistics, growth trends and suspension analysis',
      stats: members ? [
        { label: 'Total Members', value: fmtNum(members.totalMembers) },
        { label: 'Active', value: fmtNum(members.activeMembers) },
        { label: 'New This Month', value: fmtNum(members.newMembersThisMonth) },
        { label: 'Suspended', value: fmtNum(members.suspendedMembers) },
      ] : null,
    },
    {
      label: 'Reconciliation',
      href: '/dashboard/reports/reconciliation',
      desc: 'Payroll deduction reconciliation and discrepancy analysis',
      stats: null,
    },
  ];

  return (
    <RoleGuard allowedRoles={['MANAGER', 'ACCOUNTANT', 'AUDITOR', 'LOAN_OFFICER', 'MEMBER_OFFICER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cooperative analytics and performance reports</p>
        </div>

        {/* At a glance */}
        {fin && loans && members && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">At a Glance</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: fmtETB((fin.totalSavings ?? 0) + (fin.totalShareCapital ?? 0)) },
                { label: 'Active Members', value: fmtNum(members.activeMembers) },
                { label: 'Active Loans', value: fmtNum(loans.activeLoans) },
                { label: 'Liquidity Ratio', value: fmtPct(fin.liquidityRatio) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((r) => (
            <Link key={r.href} href={r.href}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="px-5 py-4">
                {r.stats ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {r.stats.map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{s.label}</span>
                        <span className="text-xs font-semibold text-gray-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">View reconciliation details</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
