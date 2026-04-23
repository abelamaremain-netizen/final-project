import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import type { DocumentMeta } from '@/types';

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery,
  tagTypes: ['Document'],
  // Documents are stable once uploaded — keep cache for 5 minutes
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<DocumentMeta, FormData>({
      query: (formData) => ({
        url: '/api/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    getDocumentsByEntity: builder.query<DocumentMeta[], { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => ({
        url: '/api/documents',
        params: { entityType, entityId },
      }),
      providesTags: ['Document'],
    }),
    getDocumentMetadata: builder.query<DocumentMeta, string>({
      query: (id) => ({ url: `/api/documents/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Document', id }],
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/documents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useGetDocumentsByEntityQuery,
  useGetDocumentMetadataQuery,
  useDeleteDocumentMutation,
} = documentsApi;
