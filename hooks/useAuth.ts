import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout as logoutAction } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/app';

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const logout = useCallback(async () => {
    // Clear local state first for immediate UI feedback
    dispatch(logoutAction());
    
    try {
      // Try to call backend logout endpoint (optional)
      await logoutMutation().unwrap();
    } catch (error) {
      // Ignore backend logout errors - local state is already cleared
      console.log('Backend logout skipped or failed (local logout successful)');
    } finally {
      // Redirect to home/landing page
      router.push(ROUTES.HOME);
    }
  }, [dispatch, logoutMutation, router]);

  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user || !user.roles) return false;
      
      const roles = Array.isArray(role) ? role : [role];
      return roles.some((r) => user.roles.includes(r));
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!user || !user.roles) return false;
      return roles.some((role) => user.roles.includes(role));
    },
    [user]
  );

  const hasAllRoles = useCallback(
    (roles: string[]): boolean => {
      if (!user || !user.roles) return false;
      return roles.every((role) => user.roles.includes(role));
    },
    [user]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}
