'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="relative h-16 flex items-center justify-between px-6">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border-b border-white/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Search or breadcrumb area */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-64"
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications - Animated */}
          <button className="relative p-2.5 rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md border border-white/60 hover:from-white/90 hover:to-white/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group">
            <svg className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">3</span>
            </span>
            {/* Pulse animation */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-75"></span>
          </button>

          {/* User Info Card - Enhanced with hover effect */}
          <div
            onClick={() => router.push('/dashboard/profile')}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md border border-white/60 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
            
            {/* Avatar with animated gradient border */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            {/* User Details with better typography */}
            <div className="relative text-left">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                {mounted ? (user?.fullName || user?.username) : ''}
              </p>
              <p className="text-xs font-medium text-gray-600 group-hover:text-purple-600 transition-colors duration-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
                {mounted ? (user?.roles?.[0] || 'User') : ''}
              </p>
            </div>

            {/* Dropdown indicator */}
            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Logout Button - More engaging with gradient */}
          <button
            onClick={logout}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md border border-white/60 hover:from-red-50/90 hover:to-pink-50/80 hover:border-red-300/60 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
            title="Logout"
          >
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-pink-500/0 to-red-500/0 group-hover:from-red-500/20 group-hover:via-pink-500/20 group-hover:to-red-500/20 transition-all duration-500"></div>
            
            {/* Icon with rotation animation */}
            <svg className="relative w-5 h-5 text-gray-700 group-hover:text-red-600 transition-all duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            
            {/* Text with gradient on hover */}
            <span className="relative text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
