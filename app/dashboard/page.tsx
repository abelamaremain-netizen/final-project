'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { user } = useAuth();
  const roles = mounted ? (user?.roles ?? []) : [];
  const isManager = roles.includes('MANAGER');
  const isAdmin = roles.includes('ADMINISTRATOR');
  const isLoanOfficer = roles.includes('LOAN_OFFICER');
  const isMemberOfficer = roles.includes('MEMBER_OFFICER');
  const isAccountant = roles.includes('ACCOUNTANT');
  const isAuditor = roles.includes('AUDITOR');

  const quickActions = [
    { label: 'Add Member', href: '/dashboard/members/new', color: 'from-purple-500 to-pink-500', show: isManager || isMemberOfficer },
    { label: 'Members', href: '/dashboard/members', color: 'from-violet-500 to-purple-500', show: isManager || isMemberOfficer },
    { label: 'New Transaction', href: '/dashboard/transactions', color: 'from-green-500 to-emerald-500', show: isManager || isAccountant },
    { label: 'Accounts', href: '/dashboard/accounts', color: 'from-teal-500 to-green-500', show: isManager || isMemberOfficer || isAccountant },
    { label: 'Loan Application', href: '/dashboard/loans', color: 'from-blue-500 to-cyan-500', show: isManager || isLoanOfficer || isAccountant },
    { label: 'View Reports', href: '/dashboard/reports/financial', color: 'from-orange-500 to-red-500', show: isManager || isAccountant || isAuditor },
    { label: 'Audit Logs', href: '/dashboard/audit', color: 'from-slate-500 to-gray-600', show: isManager || isAuditor },
    { label: 'Configuration', href: '/dashboard/config', color: 'from-indigo-500 to-violet-600', show: isAdmin },
    { label: 'Users', href: '/dashboard/users', color: 'from-pink-500 to-rose-500', show: isAdmin },
    { label: 'Share Capital', href: '/dashboard/share-capital', color: 'from-amber-500 to-yellow-500', show: isManager || isMemberOfficer || isAccountant },
    { label: 'Payroll', href: '/dashboard/payroll', color: 'from-cyan-500 to-blue-500', show: isManager || isAccountant },
    { label: 'Documents', href: '/dashboard/documents', color: 'from-rose-500 to-pink-500', show: isManager || isLoanOfficer || isMemberOfficer || isAccountant },
  ].filter((a) => a.show);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      {quickActions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group relative overflow-hidden rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all text-center bg-white"
              >
                <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-br ${action.color} text-white text-xs font-semibold mb-2`}>
                  {action.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
