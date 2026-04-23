import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import { ShareCapital, PassbookEntry } from '@/types';

interface PurchaseSharesDto {
  memberId: string;
  sharesCount: number;
}

interface TransferSharesDto {
  fromMemberId: string;
  toMemberId: string;
  sharesCount: number;
}

export const shareCapitalApi = createApi({
  reducerPath: 'shareCapitalApi',
  baseQuery,
  tagTypes: ['ShareCapital', 'Passbook'],
  // Share capital changes infrequently — keep cache for 5 minutes
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    // Purchase shares
    purchaseShares: builder.mutation<void, PurchaseSharesDto>({
      query: (data) => ({
        url: '/api/shares/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShareCapital', 'Passbook'],
    }),

    // Transfer shares
    transferShares: builder.mutation<void, TransferSharesDto>({
      query: (data) => ({
        url: '/api/shares/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ShareCapital', 'Passbook'],
    }),

    // Get shares by member
    getSharesByMember: builder.query<ShareCapital, string>({
      query: (memberId) => ({ url: `/api/shares/${memberId}` }),
      providesTags: (_result, _error, memberId) => [{ type: 'ShareCapital', id: memberId }],
    }),

    // Get passbook (transaction history)
    getPassbook: builder.query<PassbookEntry[], string>({
      query: (memberId) => ({ url: `/api/members/${memberId}/passbook` }),
      providesTags: (_result, _error, memberId) => [{ type: 'Passbook', id: memberId }],
    }),
  }),
});

export const {
  usePurchaseSharesMutation,
  useTransferSharesMutation,
  useGetSharesByMemberQuery,
  useGetPassbookQuery,
} = shareCapitalApi;
