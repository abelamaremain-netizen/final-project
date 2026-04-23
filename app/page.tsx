'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/lib/store/hooks';
import { ROUTES } from '@/constants/app';

const AuthModal = dynamic(() => import('@/components/auth/AuthModal'), { ssr: false });

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => { setMounted(true); }, []);

  const handleSignIn = () => {
    if (isAuthenticated) {
      router.push(ROUTES.DASHBOARD);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">CoopManage</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#mission" className="hover:text-blue-600 transition-colors">Mission</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          <button
            onClick={handleSignIn}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {mounted && isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 px-6">
        <div className="max-w-3xl text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
            Cooperative Management Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Manage your cooperative<br />
            <span className="text-blue-600">with confidence</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            A complete system for member management, savings, loans, payroll, and financial reporting — built for Ethiopian cooperatives.
          </p>
          <button
            onClick={handleSignIn}
            className="px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {mounted && isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">About Us</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            We are dedicated to empowering cooperative societies with modern digital tools that simplify administration and improve member services.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                ),
                title: 'Member Management',
                desc: 'Register, track, and manage all cooperative members with full lifecycle support.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                ),
                title: 'Loan Processing',
                desc: 'End-to-end loan application, approval, disbursement, and repayment tracking.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
                title: 'Financial Reports',
                desc: 'Comprehensive reporting on finances, loans, membership, and reconciliation.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            To provide cooperative societies with transparent, efficient, and accessible financial management tools — enabling communities to grow their savings, access fair credit, and build lasting economic resilience.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { value: 'Transparency', label: 'Full audit trails on every action' },
              { value: 'Efficiency', label: 'Streamlined workflows for staff' },
              { value: 'Accessibility', label: 'Simple interface for all users' },
            ].map(({ value, label }) => (
              <div key={value} className="bg-white/10 rounded-xl p-6">
                <div className="text-xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-blue-200">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-500 mb-8">
            Have questions or need support? Reach out to the system administrator or your cooperative&apos;s IT team.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600">admin@cooperative.et</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-600">+251 XXX XXX XXX</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-100 bg-gray-50">
        <p className="text-center text-xs text-gray-400">
          © {mounted ? new Date().getFullYear() : '2025'} CoopManage — Cooperative Management System. All rights reserved.
        </p>
      </footer>

      {/* Auth Modal */}
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
