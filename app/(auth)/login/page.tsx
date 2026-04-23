'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/lib/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants/app';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage('');
      const response = await login(data).unwrap();
      
      // Transform backend response to match frontend User type
      const user = {
        id: '', // Backend doesn't return ID in login response
        username: response.username,
        fullName: response.username, // Use username as fullName for now
        email: '', // Backend doesn't return email in login response
        roles: response.roles,
        active: true,
      };
      
      // Store credentials in Redux and localStorage
      dispatch(setCredentials({ user, token: response.token }));
      
      // Also set token as cookie for middleware
      document.cookie = `auth_token=${response.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      // Redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(
        error?.data?.message || 'Invalid username or password. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Cooperative Management System
          </h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                {...register('username')}
                id="username"
                type="text"
                autoComplete="username"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                  errors.username ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 Cooperative Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
