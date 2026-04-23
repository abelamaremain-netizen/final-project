import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';

export interface MemberTypeCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export const memberTypeCategoriesApi = createApi({
  reducerPath: 'memberTypeCategoriesApi',
  baseQuery,
  tagTypes: ['MemberTypeCategory'],
  endpoints: (builder) => ({
    getActiveCategories: builder.query<MemberTypeCategory[], void>({
      query: () => ({ url: '/api/member-type-categories/active' }),
      providesTags: ['MemberTypeCategory'],
    }),
    getAllCategories: builder.query<MemberTypeCategory[], void>({
      query: () => ({ url: '/api/member-type-categories' }),
      providesTags: ['MemberTypeCategory'],
    }),
    createCategory: builder.mutation<MemberTypeCategory, { name: string; description?: string }>({
      query: (body) => ({ url: '/api/member-type-categories', method: 'POST', body }),
      invalidatesTags: ['MemberTypeCategory'],
    }),
    updateCategory: builder.mutation<MemberTypeCategory, { id: string; name?: string; description?: string; active?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/api/member-type-categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['MemberTypeCategory'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/member-type-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MemberTypeCategory'],
    }),
  }),
});

export const {
  useGetActiveCategoriesQuery,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = memberTypeCategoriesApi;
