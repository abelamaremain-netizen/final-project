import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import {
  Transaction,
  DepositDto,
  WithdrawalDto,
} from '@/types';

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery,
  tagTypes: ['Transaction'],
  // Transactions change frequently — keep cache for 30 seconds
  keepUnusedDataFor: 30,
  endpoints: (builder) => ({
    // Deposit to account
    deposit: builder.mutation<Transaction, DepositDto>({
      query: (data) => ({
        url: '/api/transactions/deposit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        'Transaction',
        { type: 'Transaction', id: arg.accountId },
      ],
    }),

    // Withdraw from account
    withdraw: builder.mutation<Transaction, WithdrawalDto>({
      query: (data) => ({
        url: '/api/transactions/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        'Transaction',
        { type: 'Transaction', id: arg.accountId },
      ],
    }),

    // Get transaction by ID
    getTransactionById: builder.query<Transaction, string>({
      query: (id) => ({ url: `/api/transactions/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
    }),
  }),
});

export const {
  useDepositMutation,
  useWithdrawMutation,
  useGetTransactionByIdQuery,
} = transactionsApi;
