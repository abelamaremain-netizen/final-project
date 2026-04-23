'use client';

import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import {
  useAddCollateralMutation,
  useGetCollateralByApplicationQuery,
  useGetCollateralByLoanQuery,
  useReleaseCollateralMutation,
  useLiquidateCollateralMutation,
} from '../collateralApi';
import { toastSuccess, toastError } from '@/components/common/Toast';
import { MemberAccountPicker } from '@/components/common/MemberAccountPicker';
import { useGetAccountsByMemberQuery } from '@/features/accounts/accountsApi';
import type { Collateral } from '@/types';

interface Props {
  applicationId?: string;
  loanId?: string;
  memberId?: string;   // when known, pre-filters OWN_SAVINGS accounts to this member
  readonly?: boolean;
}

const statusColors: Record<string, string> = {
  PLEDGED: 'bg-blue-100 text-blue-700',
  RELEASED: 'bg-green-100 text-green-700',
  LIQUIDATED: 'bg-red-100 text-red-700',
};

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
const errCls = 'text-xs text-red-500 mt-1';

type CollateralType = 'OWN_SAVINGS' | 'GUARANTOR' | 'EXTERNAL_COOPERATIVE' | 'FIXED_ASSET';

interface FormState {
  collateralType: CollateralType;
  accountId: string;
  pledgedAmount: string;
  guarantorMemberId: string;
  guarantorAccountId: string;
  guaranteedAmount: string;
  externalCooperativeName: string;
  externalAccountNumber: string;
  collateralValue: string;
  assetType: string;
  assetDescription: string;
  vehicleYear: string;
  appraisalValue: string;
  appraisalDate: string;
  appraisedBy: string;
}

const defaultForm: FormState = {
  collateralType: 'OWN_SAVINGS',
  accountId: '',
  pledgedAmount: '',
  guarantorMemberId: '',
  guarantorAccountId: '',
  guaranteedAmount: '',
  externalCooperativeName: '',
  externalAccountNumber: '',
  collateralValue: '',
  assetType: 'REAL_ESTATE',
  assetDescription: '',
  vehicleYear: '',
  appraisalValue: '',
  appraisalDate: '',
  appraisedBy: '',
};

function buildPayload(form: FormState, targetId: string) {
  const base: any = { loanId: targetId, collateralType: form.collateralType };
  switch (form.collateralType) {
    case 'OWN_SAVINGS':
      base.accountId = form.accountId || undefined;
      base.pledgedAmount = parseFloat(form.pledgedAmount);
      base.collateralValue = parseFloat(form.pledgedAmount);
      break;
    case 'GUARANTOR':
      base.guarantorMemberId = form.guarantorMemberId || undefined;
      base.guarantorAccountId = form.guarantorAccountId || undefined;
      base.guaranteedAmount = parseFloat(form.guaranteedAmount);
      base.collateralValue = parseFloat(form.guaranteedAmount);
      break;
    case 'EXTERNAL_COOPERATIVE':
      base.externalCooperativeName = form.externalCooperativeName;
      base.externalAccountNumber = form.externalAccountNumber;
      base.collateralValue = parseFloat(form.collateralValue);
      break;
    case 'FIXED_ASSET':
      base.assetType = form.assetType;
      base.assetDescription = form.assetDescription;
      base.appraisalValue = parseFloat(form.appraisalValue);
      base.collateralValue = parseFloat(form.appraisalValue);
      if (form.vehicleYear) base.vehicleYear = parseInt(form.vehicleYear);
      if (form.appraisalDate) base.appraisalDate = form.appraisalDate;
      if (form.appraisedBy) base.appraisedBy = form.appraisedBy;
      break;
  }
  return base;
}

export function CollateralForm({ applicationId, loanId, memberId, readonly = false }: Props) {
  const targetId = applicationId ?? loanId ?? '';
  const isApplication = !!applicationId;

  const appQuery = useGetCollateralByApplicationQuery(targetId, { skip: !isApplication });
  const loanQuery = useGetCollateralByLoanQuery(targetId, { skip: isApplication });
  const { data: collaterals = [], isLoading, refetch } = isApplication ? appQuery : loanQuery;

  // Pre-load member's accounts for OWN_SAVINGS when memberId is known
  const { data: memberAccounts = [] } = useGetAccountsByMemberQuery(memberId ?? '', { skip: !memberId });

  const [addCollateral, { isLoading: adding }] = useAddCollateralMutation();
  const [releaseCollateral] = useReleaseCollateralMutation();
  const [liquidateCollateral] = useLiquidateCollateralMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formError, setFormError] = useState('');

  const set = (key: keyof FormState, val: string) => setForm(f => ({ ...f, [key]: val }));

  const validate = (): string => {
    switch (form.collateralType) {
      case 'OWN_SAVINGS':
        if (!form.accountId) return 'Select the member account to pledge';
        if (!form.pledgedAmount || isNaN(parseFloat(form.pledgedAmount))) return 'Pledged amount is required';
        break;
      case 'GUARANTOR':
        if (!form.guarantorAccountId) return 'Guarantor account is required to lock funds';
        if (!form.guaranteedAmount || isNaN(parseFloat(form.guaranteedAmount))) return 'Guaranteed amount is required';
        break;
      case 'EXTERNAL_COOPERATIVE':
        if (!form.externalCooperativeName) return 'Cooperative name is required';
        if (!form.collateralValue || isNaN(parseFloat(form.collateralValue))) return 'Collateral value is required';
        break;
      case 'FIXED_ASSET':
        if (!form.appraisalValue || isNaN(parseFloat(form.appraisalValue))) return 'Appraised value is required';
        if (!form.appraisalDate) return 'Appraisal date is required';
        break;
    }
    return '';
  };

  const handleAdd = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError('');
    try {
      await addCollateral(buildPayload(form, targetId)).unwrap();
      toastSuccess('Collateral added');
      setForm(defaultForm);
      setShowForm(false);
      refetch();
    } catch (e: any) {
      setFormError(e?.data?.message ?? 'Failed to add collateral');
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await releaseCollateral(id).unwrap();
      toastSuccess('Collateral released');
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Collateral can only be released after the loan is paid off');
    }
  };

  const handleLiquidate = async (id: string) => {
    try {
      await liquidateCollateral(id).unwrap();
      toastSuccess('Collateral liquidated');
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to liquidate collateral');
    }
  };

  if (isLoading) return <div className="flex justify-center py-4"><CircularProgress size={20} /></div>;

  return (
    <div className="space-y-4">
      {collaterals.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 text-center py-2">No collateral recorded.</p>
      )}

      {(collaterals as Collateral[]).map((c) => (
        <div key={c.id} className="p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{c.collateralType?.replace(/_/g, ' ')}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {c.status}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Coverage: ETB {(c.pledgedAmount ?? c.guaranteedAmount ?? c.appraisalValue ?? c.collateralValue)?.toLocaleString()}
          </p>
          {c.assetDescription && <p className="text-xs text-gray-500">{c.assetDescription}</p>}
          {c.externalCooperativeName && <p className="text-xs text-gray-500">{c.externalCooperativeName}</p>}
          {!readonly && c.status === 'PLEDGED' && (
            <div className="flex gap-3 pt-1 items-center">
              <button
                onClick={() => handleRelease(c.id)}
                className="text-xs text-green-600 hover:underline"
                title="Collateral can only be released after the loan is paid off"
              >
                Release
              </button>
              <button
                onClick={() => handleLiquidate(c.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Liquidate
              </button>
            </div>
          )}
        </div>
      ))}

      {!readonly && (
        showForm ? (
          <div className="space-y-3 p-4 rounded-xl bg-white/40 border border-white/40">
            <div>
              <label className={labelCls}>Collateral Type</label>
              <select value={form.collateralType} onChange={e => set('collateralType', e.target.value as CollateralType)} className={inputCls}>
                <option value="OWN_SAVINGS">Own Savings</option>
                <option value="GUARANTOR">Guarantor</option>
                <option value="EXTERNAL_COOPERATIVE">External Cooperative</option>
                <option value="FIXED_ASSET">Fixed Asset</option>
              </select>
            </div>

            {form.collateralType === 'OWN_SAVINGS' && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Member Account *</label>
                  {memberId && memberAccounts.length > 0 ? (
                    // Show the applicant's own accounts directly
                    <select
                      value={form.accountId}
                      onChange={e => set('accountId', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select account…</option>
                      {memberAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountType.replace(/_/g, ' ')} — ETB {Number(acc.availableBalance).toLocaleString()} available
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Fallback: generic account picker
                    <>
                      <p className="text-xs text-gray-500 mb-1">Select the member's savings account to pledge</p>
                      <MemberAccountPicker
                        onAccountSelected={(accountId) => set('accountId', accountId)}
                      />
                    </>
                  )}
                  {form.accountId && (
                    <p className="text-xs text-green-600 mt-1">Account selected ✓</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Pledged Amount (ETB) *</label>
                  <input type="number" step="0.01" value={form.pledgedAmount} onChange={e => set('pledgedAmount', e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
              </div>
            )}

            {form.collateralType === 'GUARANTOR' && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Guarantor Account *</label>
                  <p className="text-xs text-gray-500 mb-1">Select the guarantor's account to lock funds</p>
                  <MemberAccountPicker
                    onAccountSelected={(accountId, acc) => {
                      set('guarantorAccountId', accountId);
                      if (acc) set('guarantorMemberId', (acc as any).memberId ?? '');
                    }}
                  />
                  {form.guarantorAccountId && (
                    <p className="text-xs text-green-600 mt-1">Account selected: {form.guarantorAccountId.slice(0, 8)}…</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Guaranteed Amount (ETB) *</label>
                  <input type="number" step="0.01" value={form.guaranteedAmount} onChange={e => set('guaranteedAmount', e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
              </div>
            )}

            {form.collateralType === 'EXTERNAL_COOPERATIVE' && (
              <>
                <div>
                  <label className={labelCls}>Cooperative Name</label>
                  <input value={form.externalCooperativeName} onChange={e => set('externalCooperativeName', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input value={form.externalAccountNumber} onChange={e => set('externalAccountNumber', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Collateral Value (ETB)</label>
                  <input type="number" step="0.01" value={form.collateralValue} onChange={e => set('collateralValue', e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
              </>
            )}

            {form.collateralType === 'FIXED_ASSET' && (
              <>
                <div>
                  <label className={labelCls}>Asset Type</label>
                  <select value={form.assetType} onChange={e => set('assetType', e.target.value)} className={inputCls}>
                    <option value="REAL_ESTATE">Real Estate</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input value={form.assetDescription} onChange={e => set('assetDescription', e.target.value)} className={inputCls} placeholder="Asset description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Appraised Value (ETB)</label>
                    <input type="number" step="0.01" value={form.appraisalValue} onChange={e => set('appraisalValue', e.target.value)} className={inputCls} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelCls}>Appraisal Date</label>
                    <input type="date" value={form.appraisalDate} onChange={e => set('appraisalDate', e.target.value)} className={inputCls} />
                  </div>
                </div>
                {form.assetType === 'VEHICLE' && (
                  <div>
                    <label className={labelCls}>Vehicle Year</label>
                    <input type="number" value={form.vehicleYear} onChange={e => set('vehicleYear', e.target.value)} className={inputCls} placeholder="2020" />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Appraised By</label>
                  <input value={form.appraisedBy} onChange={e => set('appraisedBy', e.target.value)} className={inputCls} placeholder="Appraiser name" />
                </div>
              </>
            )}

            {formError && <p className={errCls}>{formError}</p>}

            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={adding} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold disabled:opacity-60">
                {adding ? <CircularProgress size={14} color="inherit" /> : 'Add Collateral'}
              </button>
              <button onClick={() => { setShowForm(false); setFormError(''); setForm(defaultForm); }} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="text-xs text-blue-600 hover:underline font-medium">
            + Add Collateral
          </button>
        )
      )}
    </div>
  );
}
