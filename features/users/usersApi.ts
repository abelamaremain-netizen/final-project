import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/lib/api/client';
import type { UserDto, CreateUserDto, UpdateUserDto, RoleAssignmentRequest, RoleDto, PageResponse } from '@/types';

export interface UserAdminEventDto {
  id: string;
  userId: string;
  username: string;
  eventType: string;
  performedBy: string;
  performedAt: string;
  description?: string;
}

export interface RoleAssignmentAuditDto {
  id: string;
  userId: string;
  roleId: string;
  roleName?: string;
  action: 'grant' | 'revoke';
  performedBy: string;
  performedAt: string;
  reason?: string;
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User', 'UserRoles'],
  // User data is relatively stable — keep cache for 5 minutes
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getUsers: builder.query<PageResponse<UserDto>, { page?: number; size?: number; sort?: string }>({
      query: ({ page = 0, size = 20, sort } = {}) => ({
        url: '/api/users',
        params: { page, size, ...(sort && { sort }) },
      }),
      providesTags: (result) =>
        result
          ? [...result.content.map(({ id }) => ({ type: 'User' as const, id })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<UserDto, string>({
      query: (id) => ({ url: `/api/users/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    getCurrentUser: builder.query<UserDto, void>({
      query: () => ({ url: '/api/users/me' }),
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    createUser: builder.mutation<UserDto, CreateUserDto>({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<UserDto, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({ url: `/api/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    activateUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/users/${id}/activate`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    deactivateUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/users/${id}/deactivate`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    getUserRoles: builder.query<RoleDto[], string>({
      query: (userId) => ({ url: `/api/users/${userId}/roles` }),
      providesTags: (_r, _e, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    grantRole: builder.mutation<void, { userId: string } & RoleAssignmentRequest>({
      query: ({ userId, ...body }) => ({ url: `/api/users/${userId}/roles`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: 'UserRoles', id: userId }, { type: 'User', id: userId }],
    }),

    revokeRole: builder.mutation<void, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({ url: `/api/users/${userId}/roles/${roleId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: 'UserRoles', id: userId }, { type: 'User', id: userId }],
    }),

    updateMe: builder.mutation<UserDto, { email?: string; username?: string; password?: string }>({
      query: (body) => ({ url: '/api/users/me', method: 'PUT', body }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),

    resetPassword: builder.mutation<void, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/api/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }],
    }),

    getAllRoles: builder.query<RoleDto[], void>({
      query: () => ({ url: '/api/roles' }),
    }),

    getUserAdminAudit: builder.query<UserAdminEventDto[], string>({
      query: (userId) => ({ url: `/api/users/${userId}/audit` }),
      providesTags: (_r, _e, userId) => [{ type: 'User', id: `audit-${userId}` }],
    }),

    getRoleAuditTrail: builder.query<RoleAssignmentAuditDto[], string>({
      query: (userId) => ({ url: `/api/users/${userId}/audit/roles` }),
      providesTags: (_r, _e, userId) => [{ type: 'UserRoles', id: `audit-${userId}` }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserRolesQuery,
  useGrantRoleMutation,
  useRevokeRoleMutation,
  useGetAllRolesQuery,
  useResetPasswordMutation,
  useUpdateMeMutation,
  useGetUserAdminAuditQuery,
  useGetRoleAuditTrailQuery,
} = usersApi;
