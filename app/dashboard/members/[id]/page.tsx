'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import {
  useGetMemberByIdQuery,
  useSuspendMemberMutation,
  useReactivateMemberMutation,
  useGetSuspensionHistoryQuery,
  useCalculateWithdrawalPayoutQuery,
  useInitiateWithdrawalMutation,
  useGetMemberPassbookQuery,
  useIncreaseDeductionMutation,
  useDecreaseDeductionMutation,
  useUpdateMemberMutation,
} from '@/features/members/membersApi';
import { useGetAccountsByMemberQuery } from '@/features/accounts/accountsApi';
import type { AccountDto } from '@/features/accounts/accountsApi';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DocumentManager } from '@/features/documents/components/DocumentManager';
import type { MemberSuspension, PassbookTransactionDto, PassbookLoanDto } from '@/types';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const tabs = ['overview', 'accounts', 'passbook', 'suspensions', 'documents', 'withdrawal'] as const;
  const [tab, setTab] = useState<'overview' | 'accounts' | 'passbook' | 'suspensions' | 'documents' | 'withdrawal'>('overview');
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [showWithdrawalConfirm, setShowWithdrawalConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({ email: '', phoneNumber: '', address: '', employmentStatus: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const { data: member, isLoading, isError } = useGetMemberByIdQuery(id);
  const { data: accounts = [] } = useGetAccountsByMemberQuery(id);
  const { data: suspensions = [] } = useGetSuspensionHistoryQuery(id, { skip: tab !== 'suspensions' });
  const { data: passbook } = useGetMemberPassbookQuery(id, { skip: tab !== 'passbook' });
  const { data: payout } = useCalculateWithdrawalPayoutQuery(id, { skip: tab !== 'withdrawal' });

  const [suspendMember, { isLoading: suspending }] = useSuspendMemberMutation();
  const [reactivateMember, { isLoading: reactivating }] = useReactivateMemberMutation();
  const [initiateWithdrawal, { isLoading: withdrawing }] = useInitiateWithdrawalMutation();
  const [increaseDeduction, { isLoading: increasing }] = useIncreaseDeductionMutation();
  const [decreaseDeduction, { isLoading: decreasing }] = useDecreaseDeductionMutation();
  const [updateMember, { isLoading: updating }] = useUpdateMemberMutation();

  const [deductionAmount, setDeductionAmount] = useState('');
  const [deductionError, setDeductionError] = useState('');

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return;
    try {
      await suspendMember({ id, reason: suspendReason }).unwrap();
      setShowSuspendForm(false);
      setSuspendReason('');
    } catch {}
  };

  const handleReactivate = async () => {
    try { await reactivateMember(id).unwrap(); } catch {}
  };

  const handleWithdrawal = async () => {
    if (!withdrawalReason.trim()) return;
    try {
      await initiateWithdrawal({ id, reason: withdrawalReason }).unwrap();
      setShowWithdrawalConfirm(false);
      router.push('/dashboard/members');
    } catch {}
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-yellow-100 text-yellow-700',
    WITHDRAWN: 'bg-red-100 text-red-700',
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <CircularProgress />
    </div>
  );

  if (isError || !member) return (
    <div className="text-center py-16 text-gray-500">Member not found.</div>
  );

  return (
    <RoleGuard allowedRoles={['MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'LOAN_OFFICER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-2 block">
              &larr; Back to Members
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {member.email && <span className="mr-3">{member.email}</span>}
              {member.phoneNumber && <span>{member.phoneNumber}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[member.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {member.status}
            </span>
            <button
              onClick={() => { setShowEditForm(f => !f); setEditData({ email: member.email ?? '', phoneNumber: member.phoneNumber ?? '', address: member.address ?? '', employmentStatus: member.employmentStatus ?? '' }); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Edit Profile
            </button>
            {member.status === 'ACTIVE' && (
              <button
                onClick={() => setShowSuspendForm(f => !f)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Suspend
              </button>
            )}
            {member.status === 'SUSPENDED' && (
              <button
                onClick={handleReactivate}
                disabled={reactivating}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {reactivating ? 'Reactivating...' : 'Reactivate'}
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        {showEditForm && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
            <h3 className="text-sm font-semibold text-blue-800">Edit Profile</h3>
            {editError && <p className="text-xs text-red-600">{editError}</p>}
            {editSuccess && <p className="text-xs text-green-600">Profile updated successfully.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone Number', key: 'phoneNumber', type: 'text' },
                { label: 'Address', key: 'address', type: 'text' },
                { label: 'Employment Status', key: 'employmentStatus', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editData as any)[key]}
                    onChange={(e) => setEditData(d => ({ ...d, [key]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setEditError('');
                  setEditSuccess(false);
                  try {
                    await updateMember({ id, data: {
                      email: editData.email || undefined,
                      phoneNumber: editData.phoneNumber || undefined,
                      address: editData.address || undefined,
                      employmentStatus: editData.employmentStatus || undefined,
                    }}).unwrap();
                    setEditSuccess(true);
                    setShowEditForm(false);
                  } catch (e: any) {
                    setEditError(e?.data?.message ?? 'Update failed.');
                  }
                }}
                disabled={updating}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setShowEditForm(false)} className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Suspend Form */}
        {showSuspendForm && (
          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 space-y-3">
            <h3 className="text-sm font-semibold text-yellow-800">Suspend Member</h3>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              rows={2}
              placeholder="Reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSuspend}
                disabled={suspending || !suspendReason.trim()}
                className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                {suspending ? 'Suspending...' : 'Confirm Suspend'}
              </button>
              <button onClick={() => setShowSuspendForm(false)} className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-3">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Personal Info</h2>
              {[
                ['National ID', member.nationalId],
                ['Date of Birth', member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : null],
                ['Member Type', member.memberType],
                ['Registration Date', member.registrationDate ? new Date(member.registrationDate).toLocaleDateString() : null],
              ].map(([label, value]) => value ? (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ) : null)}
            </div>

            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-3">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Employment</h2>
              {[
                ['Status', member.employmentStatus],
                ['Committed Deduction', member.committedDeduction ? `ETB ${Number(member.committedDeduction).toLocaleString()}` : null],
              ].map(([label, value]) => value ? (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ) : null)}
            </div>

            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-3">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Address</h2>
              {member.address && (
                <div className="text-sm text-gray-800">{member.address}</div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-3 md:col-span-2">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Monthly Deduction</h2>
              <p className="text-sm text-gray-600">
                Current: <span className="font-semibold text-gray-800">
                  ETB {member.committedDeduction ? Number(member.committedDeduction).toLocaleString() : '—'}
                </span>
              </p>
              {deductionError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{deductionError}</p>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="New amount"
                  value={deductionAmount}
                  onChange={(e) => { setDeductionAmount(e.target.value); setDeductionError(''); }}
                  className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  disabled={!deductionAmount || increasing}
                  onClick={async () => {
                    setDeductionError('');
                    try {
                      await increaseDeduction({ id, newDeductionAmount: Number(deductionAmount) }).unwrap();
                      setDeductionAmount('');
                    } catch (e: any) {
                      setDeductionError(e?.data?.message ?? 'Failed to increase deduction');
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {increasing ? 'Saving...' : 'Increase'}
                </button>
                <button
                  disabled={!deductionAmount || decreasing}
                  onClick={async () => {
                    setDeductionError('');
                    try {
                      await decreaseDeduction({ id, newDeductionAmount: Number(deductionAmount) }).unwrap();
                      setDeductionAmount('');
                    } catch (e: any) {
                      setDeductionError(e?.data?.message ?? 'Failed to decrease deduction');
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {decreasing ? 'Saving...' : 'Decrease'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {tab === 'accounts' && (
          <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 overflow-hidden">
            {accounts.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No accounts found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/30 border-b border-white/40">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Account ID</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Balance</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc: AccountDto) => (
                    <tr key={acc.id} className="border-b border-white/20 hover:bg-white/20">
                      <td className="px-4 py-3 text-gray-700">{acc.accountType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600 select-all">{acc.id}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 font-semibold">ETB {Number(acc.balance).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          acc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          acc.status === 'FROZEN' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{acc.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/accounts/${acc.id}`)}
                            className="text-xs text-blue-600 hover:underline"
                          >View</button>
                          {acc.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => router.push(`/dashboard/transactions?accountId=${acc.id}&action=deposit`)}
                                className="text-xs text-green-600 hover:underline"
                              >Deposit</button>
                              <button
                                onClick={() => router.push(`/dashboard/transactions?accountId=${acc.id}&action=withdraw`)}
                                className="text-xs text-red-600 hover:underline"
                              >Withdraw</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Passbook Tab */}
        {tab === 'passbook' && (
          <div className="space-y-4">
            {!passbook ? (
              <p className="text-center text-gray-500 py-12">No passbook data.</p>
            ) : (
              <>
                {/* Print button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Passbook
                  </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {([
                    ['Regular Savings', `ETB ${Number(passbook.regularSavingsBalance ?? 0).toLocaleString()}`],
                    ['Non-Regular Savings', `ETB ${Number(passbook.nonRegularSavingsBalance ?? 0).toLocaleString()}`],
                    ['Total Savings', `ETB ${Number(passbook.totalSavings ?? 0).toLocaleString()}`],
                    ['Shares', `${passbook.shareCount ?? 0} shares`],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-white/50 border border-white/30">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-bold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Available vs Pledged */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/50 border border-white/30">
                    <p className="text-xs text-gray-500">Available Balance</p>
                    <p className="text-sm font-bold text-green-700">ETB {Number(passbook.availableBalance ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/50 border border-white/30">
                    <p className="text-xs text-gray-500">Pledged Amount</p>
                    <p className="text-sm font-bold text-orange-600">ETB {Number(passbook.pledgedAmount ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Regular Savings Transactions */}
                {passbook.regularSavingsTransactions?.length > 0 && (
                  <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 overflow-hidden">
                    <div className="px-4 py-2 bg-white/30 border-b border-white/40">
                      <h3 className="text-xs font-semibold text-gray-700">Regular Savings Transactions</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-white/20 border-b border-white/30">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Date</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Type</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Description</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Amount</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passbook.regularSavingsTransactions.map((tx: PassbookTransactionDto, i: number) => (
                          <tr key={i} className="border-b border-white/20 hover:bg-white/20">
                            <td className="px-4 py-2 text-gray-600">{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 text-gray-700">{tx.type}</td>
                            <td className="px-4 py-2 text-gray-600">{tx.description || '-'}</td>
                            <td className={`px-4 py-2 text-right font-medium ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                              ETB {Number(tx.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900">ETB {Number(tx.balance).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Non-Regular Savings Transactions */}
                {passbook.nonRegularSavingsTransactions?.length > 0 && (
                  <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 overflow-hidden">
                    <div className="px-4 py-2 bg-white/30 border-b border-white/40">
                      <h3 className="text-xs font-semibold text-gray-700">Non-Regular Savings Transactions</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-white/20 border-b border-white/30">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Date</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Type</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Amount</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passbook.nonRegularSavingsTransactions.map((tx: PassbookTransactionDto, i: number) => (
                          <tr key={i} className="border-b border-white/20 hover:bg-white/20">
                            <td className="px-4 py-2 text-gray-600">{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 text-gray-700">{tx.type}</td>
                            <td className={`px-4 py-2 text-right font-medium ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                              ETB {Number(tx.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900">ETB {Number(tx.balance).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Loans summary */}
                {passbook.loans?.length > 0 && (
                  <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 overflow-hidden">
                    <div className="px-4 py-2 bg-white/30 border-b border-white/40">
                      <h3 className="text-xs font-semibold text-gray-700">Loans ({passbook.loans.length})</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-white/20 border-b border-white/30">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Disbursed</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Principal</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Outstanding</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passbook.loans.map((loan: PassbookLoanDto) => (
                          <tr key={loan.loanId} className="border-b border-white/20 hover:bg-white/20">
                            <td className="px-4 py-2 text-gray-600">{loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 text-right text-gray-800">ETB {Number(loan.principal).toLocaleString()}</td>
                            <td className="px-4 py-2 text-right text-orange-600">ETB {Number(loan.outstandingBalance).toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                loan.status === 'PAID_OFF' ? 'bg-blue-100 text-blue-700' :
                                loan.status === 'ACTIVE' || loan.status === 'DISBURSED' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{loan.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!passbook.regularSavingsTransactions?.length && !passbook.nonRegularSavingsTransactions?.length && (
                  <p className="text-center text-gray-500 py-8">No transactions in passbook.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Suspensions Tab */}
        {tab === 'suspensions' && (
          <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 overflow-hidden">
            {suspensions.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No suspension history.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-white/30 border-b border-white/40">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Reason</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Suspended At</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Lifted At</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {suspensions.map((s: MemberSuspension) => (
                    <tr key={s.id} className="border-b border-white/20 hover:bg-white/20">
                      <td className="px-4 py-3 text-gray-700">{s.reason}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.suspendedAt ? new Date(s.suspendedAt).toLocaleDateString() :
                         s.suspendedDate ? new Date(s.suspendedDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.liftedAt ? new Date(s.liftedAt).toLocaleDateString() :
                         s.reactivatedDate ? new Date(s.reactivatedDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.active !== false && !s.liftedAt && !s.reactivatedDate
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {s.active !== false && !s.liftedAt && !s.reactivatedDate ? 'Active' : 'Lifted'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {tab === 'documents' && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <DocumentManager entityType="MEMBER" entityId={id} canDelete={true} />
          </div>
        )}

        {/* Withdrawal Tab */}
        {tab === 'withdrawal' && (
          <div className="space-y-4">
            {payout ? (
              <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-4">
                <h2 className="text-base font-bold text-gray-800">Withdrawal Payout Estimate</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ['Regular Savings', `ETB ${Number(payout.regularSavingBalance).toLocaleString()}`],
                    ['Non-Regular Savings', `ETB ${Number(payout.nonRegularSavingBalance).toLocaleString()}`],
                    ['Share Value', `ETB ${Number(payout.shareValue).toLocaleString()}`],
                    ['Accrued Interest', `ETB ${Number(payout.accruedInterest).toLocaleString()}`],
                    ['Outstanding Loans', `ETB ${Number(payout.outstandingLoans).toLocaleString()}`],
                    ['Net Payout', `ETB ${Number(payout.netPayout).toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-white/50 border border-white/30">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className={`text-sm font-bold ${label === 'Net Payout' ? 'text-green-700' : 'text-gray-800'}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8"><CircularProgress size={24} /></div>
            )}

            {member.status === 'ACTIVE' && (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <h3 className="text-sm font-semibold text-red-800">Initiate Withdrawal</h3>
                <p className="text-xs text-red-600">This action will begin the member withdrawal process and cannot be undone.</p>
                {showWithdrawalConfirm ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-red-300 text-sm text-gray-700 focus:outline-none"
                      rows={2}
                      placeholder="Reason for withdrawal..."
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleWithdrawal}
                        disabled={withdrawing || !withdrawalReason.trim()}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                      </button>
                      <button onClick={() => setShowWithdrawalConfirm(false)} className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWithdrawalConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Initiate Withdrawal
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
