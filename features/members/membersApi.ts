import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import type { Member, MemberSuspension, PageResponse, PaginationParams, PassbookDto } from '@/types';

export interface MemberSearchParams extends PaginationParams {
  search?: string;
  status?: string;
  memberType?: string;
  sort?: string; // e.g. "lastName,asc" or "registrationDate,desc"
}

export interface CreateMemberRequest {
  memberType: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  employmentStatus: string;
  committedDeduction: number;
  shareCount?: number;
  externalCooperativeName?: string;
  externalCooperativeMemberId?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  employmentStatus?: string;
}

export interface WithdrawalPayout {
  memberId: string;
  memberName: string;
  regularSavingBalance: number;
  nonRegularSavingBalance: number;
  totalSavings: number;
  shareCount: number;
  sharePrice: number;
  shareValue: number;
  accruedInterest: number;
  outstandingLoans: number;
  processingFees: number;
  otherDeductions: number;
  totalDeductions: number;
  grossPayout: number;
  netPayout: number;
  currency: string;
}

export const membersApi = createApi({
  reducerPath: 'membersApi',
  baseQuery,
  tagTypes: ['Member', 'Members'],
  // Member data is relatively stable — keep cache for 5 minutes
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    // Backend returns Page<MemberDto>
    getMembers: builder.query<PageResponse<Member>, MemberSearchParams>({
      query: ({ page = 0, size = 20, search, status, memberType, sort }) => ({
        url: '/api/members',
        params: {
          page, size,
          ...(search && { search }),
          ...(status && { status }),
          ...(memberType && { memberType }),
          ...(sort && { sort }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }: Member) => ({ type: 'Member' as const, id })),
              { type: 'Members', id: 'LIST' },
            ]
          : [{ type: 'Members', id: 'LIST' }],
    }),

    getMemberById: builder.query<Member, string>({
      query: (id) => ({ url: `/api/members/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Member', id }],
    }),

    // Backend endpoint is POST /api/members/register
    createMember: builder.mutation<Member, CreateMemberRequest>({
      query: (body) => ({
        url: '/api/members/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Members', id: 'LIST' }],
    }),

    updateMember: builder.mutation<Member, { id: string; data: UpdateMemberRequest }>({
      query: ({ id, data }) => ({
        url: `/api/members/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Member', id },
        { type: 'Members', id: 'LIST' },
      ],
    }),

    searchMembers: builder.query<Member[], string>({
      query: (query) => ({
        url: '/api/members/search',
        params: { q: query },
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Member' as const, id })), { type: 'Members', id: 'SEARCH' }]
          : [{ type: 'Members', id: 'SEARCH' }],
    }),

    suspendMember: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/members/${id}/suspend`,
        method: 'POST',
        params: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Member', id }, { type: 'Members', id: 'LIST' }],
    }),

    reactivateMember: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/members/${id}/reactivate`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Member', id }, { type: 'Members', id: 'LIST' }],
    }),

    getSuspensionHistory: builder.query<MemberSuspension[], string>({
      query: (id) => ({ url: `/api/members/${id}/suspensions` }),
      providesTags: (_r, _e, id) => [{ type: 'Member', id }],
    }),

    initiateWithdrawal: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/members/${id}/withdrawal`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Member', id }, { type: 'Members', id: 'LIST' }],
    }),

    calculateWithdrawalPayout: builder.query<WithdrawalPayout, string>({
      query: (id) => ({ url: `/api/members/${id}/withdrawal-payout` }),
    }),

    getMemberPassbook: builder.query<PassbookDto, string>({
      query: (memberId) => ({ url: `/api/members/${memberId}/passbook` }),
      providesTags: (_r, _e, id) => [{ type: 'Member', id }],
    }),

    increaseDeduction: builder.mutation<void, { id: string; newDeductionAmount: number }>({
      query: ({ id, newDeductionAmount }) => ({
        url: `/api/members/${id}/deduction/increase`,
        method: 'PUT',
        body: { newDeductionAmount },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Member', id }],
    }),

    decreaseDeduction: builder.mutation<void, { id: string; newDeductionAmount: number }>({
      query: ({ id, newDeductionAmount }) => ({
        url: `/api/members/${id}/deduction/decrease`,
        method: 'PUT',
        body: { newDeductionAmount },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Member', id }],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useSearchMembersQuery,
  useLazySearchMembersQuery,
  useSuspendMemberMutation,
  useReactivateMemberMutation,
  useGetSuspensionHistoryQuery,
  useInitiateWithdrawalMutation,
  useCalculateWithdrawalPayoutQuery,
  useGetMemberPassbookQuery,
  useIncreaseDeductionMutation,
  useDecreaseDeductionMutation,
} = membersApi;
