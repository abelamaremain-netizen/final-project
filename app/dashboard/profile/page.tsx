'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCurrentUserQuery, useUpdateMeMutation } from '@/features/users/usersApi';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (password && password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password && password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const data: any = {};
    if (username.trim()) data.username = username.trim();
    if (email.trim()) data.email = email.trim();
    if (password.trim()) data.password = password.trim();
    if (Object.keys(data).length === 0) { setError('No changes to save'); return; }
    try {
      await updateMe(data).unwrap();
      setSuccess('Profile updated. Re-login if you changed username or password.');
      setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (e: any) {
      setError(e?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Current Details</h2>
        <p className="text-sm text-gray-600"><span className="text-gray-400">Username: </span>{user?.username}</p>
        <p className="text-sm text-gray-600"><span className="text-gray-400">Email: </span>{user?.email}</p>
        <p className="text-sm text-gray-600"><span className="text-gray-400">Roles: </span>{user?.roles?.join(', ')}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Update Credentials</h2>
        <p className="text-xs text-gray-500">Leave fields blank to keep current values.</p>
        {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">New Username</label>
            <input type="text" placeholder={`Current: ${user?.username}`} value={username} onChange={e => setUsername(e.target.value)} className={inp} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">New Email</label>
            <input type="email" placeholder={`Current: ${user?.email}`} value={email} onChange={e => setEmail(e.target.value)} className={inp} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} className={inp} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
            <input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inp} /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
