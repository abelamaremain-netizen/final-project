import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import type { AuditLog, PageResponse } from '@/types';

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery,
  tagTypes: ['Audit'],
  // Audit logs are append-only and read frequently — keep cache for 60 seconds
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PageResponse<AuditLog>, {
      page?: number; size?: number; userId?: string;
      entityType?: string; action?: string; startDate?: string; endDate?: string;
      sort?: string;
    }>({
      query: (params) => ({ url: '/api/audit', params }),
      providesTags: ['Audit'],
    }),
    getEntityAudit: builder.query<AuditLog[], { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => ({ url: `/api/audit/entity/${entityType}/${entityId}` }),
      providesTags: ['Audit'],
    }),
    getUserAudit: builder.query<AuditLog[], string>({
      query: (userId) => ({ url: `/api/audit/user/${userId}` }),
      providesTags: ['Audit'],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetEntityAuditQuery,
  useGetUserAuditQuery,
} = auditApi;
