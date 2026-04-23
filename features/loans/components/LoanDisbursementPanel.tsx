'use client';

import { useState, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetAllLoansQuery, useDisburseLoanMutation } from '../loansApi';
import { toastSuccess, toastError } from '@/components/common/Toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Pagination } from '@/components/common/Pagination';
import { LoanStatus, Loan } from '@/types';

type SortField = 'principalAmount' | 'interestRate' | 'durationMonths';

export function LoanDisbursementPanel() {
  const { data, isLoading } = useGetAllLoansQuery({ page: 0, size: 200, status: LoanStatus.APPROVED });
  const [disburse, { isLoading: disbursing }] = useDisburseLoanMutation();
  const [target, setTarget] = useState<Loan | null>(null);

  const [sortField, setSortField] = useState<SortField>('principalAmount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const allLoans = data?.content ?? [];

  const sorted = useMemo(() => {
    return [...allLoans].sort((a, b) => {
      const av = Number((a as any)[sortField] ?? 0);
      const bv = Number((b as any)[sortField] ?? 0);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [allLoans, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(0);
  };

  const sortIcon = (field: SortField) => {
    if (field !== sortField) return <span className="ml-0.5 text-gray-300 text-xs">↕</span>;
    return <span className="ml-0.5 text-blue-500 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleDisburse = async () => {
    if (!target) return;
    try {
      await disburse(target.id).unwrap();
      toastSuccess('Loan disbursed successfully');
      setTarget(null);
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to disburse loan');
      setTarget(null);
    }
  };

  const principal = (loan: Loan) => typeof loan.principalAmount === 'object'
    ? (loan.principalAmount as any).amount
    : loan.principalAmount;

  if (isLoading) return <div className="flex justify-center py-8"><CircularProgress size={24} /></div>;

  if (allLoans.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">No approved loans awaiting disbursement</div>;
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Loan ID</th>
              <th
                className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort('principalAmount')}
              >
                Principal {sortIcon('principalAmount')}
              </th>
              <th
                className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort('interestRate')}
              >
                Rate {sortIcon('interestRate')}
              </th>
              <th
                className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort('durationMonths')}
              >
                Duration {sortIcon('durationMonths')}
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((loan: Loan) => (
              <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{loan.id.slice(0, 8)}…</td>
                <td className="px-4 py-2.5 font-semibold text-gray-800">ETB {Number(principal(loan)).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-600">{loan.interestRate}%</td>
                <td className="px-4 py-2.5 text-gray-600">{loan.durationMonths}mo</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => setTarget(loan)}
                    disabled={disbursing}
                    className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Disburse
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={sorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
          pageSizeOptions={[10]}
        />
      </div>

      {target && (
        <ConfirmDialog
          title="Disburse Loan"
          message={`Disburse ETB ${Number(principal(target)).toLocaleString()} for loan #${target.id.slice(0, 8)}? This will activate the loan and cannot be undone.`}
          confirmLabel="Disburse"
          variant="warning"
          isLoading={disbursing}
          onConfirm={handleDisburse}
          onCancel={() => setTarget(null)}
        />
      )}
    </>
  );
}
