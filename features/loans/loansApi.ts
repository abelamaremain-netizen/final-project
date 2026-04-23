import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import type {
  LoanApplication,
  Loan,
  LoanRepayment,
  LoanAppeal,
  LoanDefault,
  LoanPenalty,
  LoanRestructuring,
  CreateLoanApplicationDto,
  PageResponse,
  PaginationParams,
} from '@/types';

export const loansApi = createApi({
  reducerPath: 'loansApi',
  baseQuery,
  tagTypes: ['Loan', 'LoanApplication', 'LoanRepayment', 'LoanAppeal', 'LoanDefault', 'LoanPenalty', 'LoanRestructuring'],
  // Loan data changes moderately — keep cache for 60 seconds
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    // Applications
    createApplication: builder.mutation<LoanApplication, CreateLoanApplicationDto>({
      query: (body) => ({ url: '/api/loans/applications', method: 'POST', body }),
      invalidatesTags: ['LoanApplication'],
    }),
    getPendingApplications: builder.query<LoanApplication[], void>({
      query: () => ({ url: '/api/loans/applications/queue' }),
      providesTags: ['LoanApplication'],
    }),
    getDeniedApplications: builder.query<LoanApplication[], void>({
      query: () => ({ url: '/api/loans/applications/denied' }),
      providesTags: ['LoanApplication'],
    }),
    getApplicationById: builder.query<LoanApplication, string>({
      query: (id) => ({ url: `/api/loans/applications/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'LoanApplication', id }],
    }),
    approveApplication: builder.mutation<LoanApplication, string>({
      query: (id) => ({ url: `/api/loans/applications/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['LoanApplication', 'Loan'],
    }),
    startReview: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/loans/applications/${id}/review`, method: 'POST' }),
      invalidatesTags: ['LoanApplication'],
    }),
    rejectApplication: builder.mutation<LoanApplication, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/api/loans/applications/${id}/deny`, method: 'POST', params: { reason } }),
      invalidatesTags: ['LoanApplication'],
    }),
    // Loans
    getLoansByMember: builder.query<LoanApplication[], string>({
      query: (memberId) => ({ url: `/api/loans/applications/member/${memberId}` }),
      providesTags: ['Loan'],
    }),
    getActiveLoansByMember: builder.query<Loan[], string>({
      query: (memberId) => ({ url: `/api/loans/member/${memberId}/active` }),
      providesTags: ['Loan'],
    }),
    getAllLoans: builder.query<PageResponse<Loan>, PaginationParams & { status?: string; sort?: string }>({
      query: ({ page = 0, size = 20, status, sort }) => ({
        url: '/api/loans',
        params: { page, size, ...(status && { status }), ...(sort && { sort }) },
      }),
      providesTags: ['Loan'],
    }),
    getLoanById: builder.query<Loan, string>({
      query: (id) => ({ url: `/api/loans/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Loan', id }],
    }),
    disburseLoan: builder.mutation<Loan, string>({
      query: (id) => ({ url: `/api/loans/${id}/disburse`, method: 'POST' }),
      invalidatesTags: ['Loan', 'LoanApplication'],
    }),
    // Repayments
    recordRepayment: builder.mutation<{ status: string; warning?: string }, { loanId: string; amount: number }>({
      query: ({ loanId, amount }) => ({ url: `/api/loans/${loanId}/repayments`, method: 'POST', body: { paymentAmount: amount } }),
      invalidatesTags: (_r, _e, { loanId }) => [{ type: 'Loan', id: loanId }, 'LoanRepayment'],
    }),
    getRepaymentHistory: builder.query<LoanRepayment[], string>({
      query: (loanId) => ({ url: `/api/loans/${loanId}/repayments` }),
      providesTags: ['LoanRepayment'],
    }),
    // Appeals
    submitAppeal: builder.mutation<string, { applicationId: string; appealReason: string; memberId: string }>({
      query: ({ memberId, ...body }) => ({ url: '/api/loans/appeals', method: 'POST', body, params: { memberId } }),
      invalidatesTags: ['LoanAppeal'],
    }),
    recordAppealDecision: builder.mutation<void, { id: string; decision: 'APPROVED' | 'REJECTED'; decisionNotes?: string }>({
      query: ({ id, decision, decisionNotes }) => ({
        url: `/api/loans/appeals/${id}/decision`, method: 'POST',
        params: { decision, ...(decisionNotes && { decisionNotes }) },
      }),
      invalidatesTags: ['LoanAppeal', 'LoanApplication'],
    }),
    getPendingAppeals: builder.query<LoanAppeal[], void>({
      query: () => ({ url: '/api/loans/appeals/pending' }),
      providesTags: ['LoanAppeal'],
    }),
    getAppealsForApplication: builder.query<LoanAppeal[], string>({
      query: (applicationId) => ({ url: `/api/loans/appeals/application/${applicationId}` }),
      providesTags: ['LoanAppeal'],
    }),
    // Defaults
    declareDefault: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/api/loans/${id}/default`, method: 'POST', params: { reason } }),
      invalidatesTags: ['LoanDefault', 'Loan'],
    }),
    initiateLegalAction: builder.mutation<void, { id: string; courtCaseNumber: string }>({
      query: ({ id, courtCaseNumber }) => ({ url: `/api/loans/${id}/legal-action`, method: 'POST', params: { courtCaseNumber } }),
      invalidatesTags: ['LoanDefault'],
    }),
    resolveDefault: builder.mutation<void, { id: string; resolutionNotes: string }>({
      query: ({ id, resolutionNotes }) => ({ url: `/api/loans/${id}/resolve`, method: 'POST', params: { resolutionNotes } }),
      invalidatesTags: ['LoanDefault', 'Loan'],
    }),
    getDefaultsByStatus: builder.query<LoanDefault[], string>({
      query: (status) => ({ url: '/api/loans/defaults', params: { status } }),
      providesTags: ['LoanDefault'],
    }),
    getDefaultForLoan: builder.query<LoanDefault | null, string>({
      query: (id) => ({ url: `/api/loans/${id}/default` }),
      providesTags: ['LoanDefault'],
    }),
    // Penalties
    assessPenalty: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/loans/${id}/penalties/assess`, method: 'POST' }),
      invalidatesTags: ['LoanPenalty'],
    }),
    getLoanPenalties: builder.query<LoanPenalty[], string>({
      query: (id) => ({ url: `/api/loans/${id}/penalties` }),
      providesTags: ['LoanPenalty'],
    }),
    getTotalUnpaidPenalties: builder.query<number, string>({
      query: (id) => ({ url: `/api/loans/${id}/penalties/total` }),
      providesTags: ['LoanPenalty'],
    }),
    // Restructuring
    initiateRestructuring: builder.mutation<string, { loanId: string; restructuringReason: string; newDurationMonths: number; newInterestRate: number }>({
      query: (body) => ({ url: '/api/loans/restructurings', method: 'POST', body }),
      invalidatesTags: ['LoanRestructuring'],
    }),
    approveRestructuring: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/loans/restructurings/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['LoanRestructuring', 'Loan'],
    }),
    denyRestructuring: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/api/loans/restructurings/${id}/deny`, method: 'POST', params: { reason } }),
      invalidatesTags: ['LoanRestructuring'],
    }),
    getPendingRestructurings: builder.query<LoanRestructuring[], void>({
      query: () => ({ url: '/api/loans/restructurings/pending' }),
      providesTags: ['LoanRestructuring'],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useGetPendingApplicationsQuery,
  useGetDeniedApplicationsQuery,
  useGetApplicationByIdQuery,
  useApproveApplicationMutation,
  useStartReviewMutation,
  useRejectApplicationMutation,
  useGetLoansByMemberQuery,
  useGetActiveLoansByMemberQuery,
  useGetAllLoansQuery,
  useGetLoanByIdQuery,
  useDisburseLoanMutation,
  useRecordRepaymentMutation,
  useGetRepaymentHistoryQuery,
  useSubmitAppealMutation,
  useRecordAppealDecisionMutation,
  useGetPendingAppealsQuery,
  useGetAppealsForApplicationQuery,
  useDeclareDefaultMutation,
  useInitiateLegalActionMutation,
  useResolveDefaultMutation,
  useGetDefaultsByStatusQuery,
  useGetDefaultForLoanQuery,
  useAssessPenaltyMutation,
  useGetLoanPenaltiesQuery,
  useGetTotalUnpaidPenaltiesQuery,
  useInitiateRestructuringMutation,
  useApproveRestructuringMutation,
  useDenyRestructuringMutation,
  useGetPendingRestructuringsQuery,
} = loansApi;


