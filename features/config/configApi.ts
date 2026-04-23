import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import type { SystemConfiguration } from '@/types';

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery,
  tagTypes: ['Config'],
  // System configuration rarely changes — keep cache for 10 minutes
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getCurrentConfig: builder.query<SystemConfiguration, void>({
      query: () => ({ url: '/api/configurations/current' }),
      providesTags: ['Config'],
    }),
    getConfigHistory: builder.query<SystemConfiguration[], void>({
      query: () => ({ url: '/api/configurations/history' }),
      providesTags: ['Config'],
    }),
    getConfigByDate: builder.query<SystemConfiguration, string>({
      query: (date) => ({ url: '/api/configurations/at-date', params: { date } }),
      providesTags: ['Config'],
    }),
    createConfig: builder.mutation<SystemConfiguration, Partial<SystemConfiguration>>({
      query: (body) => ({ url: '/api/configurations', method: 'POST', body }),
      invalidatesTags: ['Config'],
    }),
  }),
});

export const {
  useGetCurrentConfigQuery,
  useGetConfigHistoryQuery,
  useGetConfigByDateQuery,
  useCreateConfigMutation,
} = configApi;
