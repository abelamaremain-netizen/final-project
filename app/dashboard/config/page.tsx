'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetCurrentConfigQuery, useGetConfigHistoryQuery } from '@/features/config/configApi';
import { ConfigForm } from '@/features/config/components/ConfigForm';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAppSelector } from '@/lib/store/hooks';
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/features/memberTypeCategories/memberTypeCategoriesApi';
import type { SystemConfiguration } from '@/types';

export default function ConfigPage() {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.roles?.includes('ADMINISTRATOR');

  const { data: current, isLoading } = useGetCurrentConfigQuery();
  const { data: history = [] } = useGetConfigHistoryQuery(undefined, { skip: !showHistory });
  const { data: categories = [], isLoading: catsLoading } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim(), description: newCatDesc.trim() || undefined }).unwrap();
      setNewCatName('');
      setNewCatDesc('');
    } catch {}
  };

  const fmt = (val?: number | null) => val != null ? `${(val * 100).toFixed(2)}%` : '—';
  const fmtMoney = (val?: number | null) => val != null ? `ETB ${Number(val).toLocaleString()}` : '—';
  const fmtNum = (val?: number | null) => val != null ? String(val) : '—';
  const fmtDate = (val?: string | null) => val ? new Date(val).toLocaleDateString() : '—';

  return (
    <RoleGuard allowedRoles={['ADMINISTRATOR']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">System Configuration</h1>
          {isAdmin && (
            <button onClick={() => setShowForm(f => !f)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold">
              {showForm ? 'Cancel' : 'New Configuration'}
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Configuration</h2>
            <ConfigForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Current Config */}
        <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Current Configuration</h2>
            {current && (
              <span className="text-xs text-gray-500">v{current.version} · Effective {fmtDate(current.effectiveDate)}</span>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-6"><CircularProgress /></div>
          ) : current ? (
            <div className="space-y-4">
              <Section title="Financial">
                <ConfigCard label="Registration Fee" value={fmtMoney(current.registrationFee)} />
                <ConfigCard label="Share Price" value={fmtMoney(current.sharePricePerShare)} />
                <ConfigCard label="Min. Shares Required" value={fmtNum(current.minimumSharesRequired)} />
                <ConfigCard label="Max. Shares Allowed" value={fmtNum(current.maximumSharesAllowed)} />
                <ConfigCard label="Min. Monthly Deduction" value={fmtMoney(current.minimumMonthlyDeduction)} />
                <ConfigCard label="Savings Interest Rate" value={fmt(current.savingsInterestRate)} />
                <ConfigCard label="Loan Rate (Min)" value={fmt(current.loanInterestRateMin)} />
                <ConfigCard label="Loan Rate (Max)" value={fmt(current.loanInterestRateMax)} />
                <ConfigCard label="Max Loan Cap" value={fmtMoney(current.maximumLoanCapPerMember)} />
                <ConfigCard label="Min. Loan Amount" value={fmtMoney(current.minimumLoanAmount)} />
                <ConfigCard label="Lending Limit" value={fmt(current.lendingLimitPercentage)} />
                <ConfigCard label="Fixed Asset LTV" value={fmt(current.fixedAssetLtvRatio)} />
              </Section>
              <Section title="Operational">
                <ConfigCard label="Membership Threshold" value={`${fmtNum(current.membershipDurationThresholdMonths)} months`} />
                <ConfigCard label="Loan Multiplier (below)" value={fmtNum(current.loanMultiplierBelowThreshold)} />
                <ConfigCard label="Loan Multiplier (above)" value={fmtNum(current.loanMultiplierAboveThreshold)} />
                <ConfigCard label="Contract Signing Deadline" value={`${fmtNum(current.contractSigningDeadlineDays)} days`} />
                <ConfigCard label="Disbursement Deadline" value={`${fmtNum(current.loanDisbursementDeadlineDays)} days`} />
                <ConfigCard label="Loan Processing SLA" value={`${fmtNum(current.loanProcessingSlaDays)} days`} />
                <ConfigCard label="Delinquency Grace Period" value={`${fmtNum(current.delinquencyGracePeriodDays)} days`} />
                <ConfigCard label="Withdrawal Processing" value={`${fmtNum(current.memberWithdrawalProcessingDays)} days`} />
                <ConfigCard label="Collateral Appraisal Validity" value={`${fmtNum(current.collateralAppraisalValidityMonths)} months`} />
                <ConfigCard label="Vehicle Age Limit" value={`${fmtNum(current.vehicleAgeLimitYears)} years`} />
                <ConfigCard label="Deduction Decrease Waiting" value={`${fmtNum(current.deductionDecreaseWaitingMonths)} months`} />
                <ConfigCard label="Non-Regular Savings Withdrawal" value={`${fmtNum(current.nonRegularSavingsWithdrawalDays)} days`} />
                <ConfigCard label="Max Active Loans" value={fmtNum(current.maximumActiveLoansPerMember)} />
                <ConfigCard label="Max Missed Deductions" value={fmtNum(current.maxConsecutiveMissedDeductionsBeforeSuspension)} />
                <ConfigCard label="Min. Membership Before Withdrawal" value={`${fmtNum(current.minimumMembershipDurationBeforeWithdrawalMonths)} months`} />
              </Section>
              <Section title="Penalties & Fees">
                <ConfigCard label="Late Payment Penalty" value={fmt(current.latePaymentPenaltyRate)} />
                <ConfigCard label="Late Payment Grace" value={`${fmtNum(current.latePaymentPenaltyGraceDays)} days`} />
                <ConfigCard label="Early Repayment Penalty" value={fmt(current.earlyLoanRepaymentPenalty)} />
                <ConfigCard label="Withdrawal Processing Fee" value={fmtMoney(current.memberWithdrawalProcessingFee)} />
                <ConfigCard label="Share Transfer Fee" value={fmtMoney(current.shareTransferFee)} />
              </Section>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No configuration found.</p>
          )}
        </div>

        {/* Member Type Categories */}
        <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Member Type Categories</h2>
          <p className="text-xs text-gray-500">Configure the member categories used when registering members. These appear as options in the member registration form.</p>

          {catsLoading ? (
            <div className="flex justify-center py-4"><CircularProgress size={24} /></div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/40">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => updateCategory({ id: cat.id, active: !cat.active })}
                          className="text-xs text-blue-600 hover:underline">
                          {cat.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-xs text-red-500 hover:underline">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No categories configured yet.</p>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="pt-2 border-t border-white/40">
              <p className="text-xs font-semibold text-gray-600 mb-2">Add New Category</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Permanent Employee)"
                  className="flex-1 min-w-40 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="flex-1 min-w-40 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={creating || !newCatName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {creating ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40">
          <button onClick={() => setShowHistory(h => !h)}
            className="text-sm font-semibold text-blue-600 hover:underline">
            {showHistory ? 'Hide' : 'Show'} Configuration History
          </button>
          {showHistory && (
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No history available.</p>
              ) : history.map((cfg: SystemConfiguration) => (
                <div key={cfg.id} className="p-3 rounded-xl bg-white/60 border border-white/40 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Version {cfg.version}</p>
                    <p className="text-xs text-gray-500">Effective: {fmtDate(cfg.effectiveDate)}</p>
                    <p className="text-xs text-gray-400">Created by: {cfg.createdBy}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600 space-y-0.5">
                    <p>Loan: {fmt(cfg.loanInterestRateMin)}–{fmt(cfg.loanInterestRateMax)}</p>
                    <p>Savings: {fmt(cfg.savingsInterestRate)}</p>
                    <p>Penalty: {fmt(cfg.latePaymentPenaltyRate)}</p>
                    <p>Lending Limit: {fmt(cfg.lendingLimitPercentage)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

function ConfigCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/60 border border-white/40">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
