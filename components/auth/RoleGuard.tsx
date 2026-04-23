'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/app';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-sm text-gray-600 mt-4">Checking permissions...</p>
    </div>
  </div>
);

export function RoleGuard({ children, allowedRoles, fallbackUrl = ROUTES.UNAUTHORIZED }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasAnyRole } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Check if user has any of the allowed roles
    if (!hasAnyRole(allowedRoles)) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, user, allowedRoles, fallbackUrl, hasAnyRole, router]);

  // Always render spinner until mounted (prevents SSR/client hydration mismatch)
  if (!mounted || !isAuthenticated || !hasAnyRole(allowedRoles)) {
    return <Spinner />;
  }

  return <>{children}</>;
}
