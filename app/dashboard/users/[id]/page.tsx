'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { ROLES } from '@/constants/app';
import {
  useGetUserByIdQuery,
  useGetUserRolesQuery,
  useGrantRoleMutation,
  useRevokeRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetAllRolesQuery,
  useUpdateUserMutation,
  useGetUserAdminAuditQuery,
  useGetRoleAuditTrailQuery,
} from '@/features/users/usersApi';

const EVENT_COLORS: Record<string, string> = {
  CREATE_USER:     'bg-green-100 text-green-700',
  ACTIVATE:        'bg-teal-100 text-teal-700',
  DEACTIVATE:      'bg-red-100 text-red-700',
  PASSWORD_CHANGE: 'bg-yellow-100 text-yellow-700',
  UPDATE_PROFILE:  'bg-blue-100 text-blue-700',
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'roles' | 'activity'>('info');
  const [grantReason, setGrantReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: user, isLoading } = useGetUserByIdQuery(id);
  const { data: roles = [] } = useGetUserRolesQuery(id);
  const { data: allRoles = [] } = useGetAllRolesQuery();
  const { data: adminEvents = [] } = useGetUserAdminAuditQuery(id, { skip: activeTab !== 'activity' });
  const { data: roleAudit = [] } = useGetRoleAuditTrailQuery(id, { skip: activeTab !== 'activity' });
  const [grantRole, { isLoading: granting }] = useGrantRoleMutation();
  const [revokeRole, { isLoading: revoking }] = useRevokeRoleMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const allActivity = [
    ...adminEvents.map(e => ({ time: e.performedAt, label: e.eventType, by: e.performedBy, desc: e.description, color: EVENT_COLORS[e.eventType] ?? 'bg-gray-100 text-gray-600' })),
    ...roleAudit.map(e => ({ time: e.performedAt, label: e.action === 'grant' ? 'ROLE_GRANT' : 'ROLE_REVOKE', by: e.performedBy, desc: `Role ${e.action}: ${e.roleName ?? e.roleId}${e.reason ? ` — ${e.reason}` : ''}`, color: e.action === 'grant' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700' })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const isActive = user?.status === 'ACTIVE';
  const assignedRoleIds = new Set(roles.map((r) => r.id));

  const handleGrant = async () => {
    if (!selectedRole || !grantReason.trim()) return;
    await grantRole({ userId: id, roleId: selectedRole, reason: grantReason });
    setSelectedRole(''); setGrantReason('');
  };

  const handleUpdateCredentials = async () => {
    const data: any = {};
    if (editEmail.trim()) data.email = editEmail.trim();
    if (newPassword.trim()) data.password = newPassword.trim();
    if (Object.keys(data).length === 0) return;
    await updateUser({ id, data });
    setEditEmail(''); setNewPassword(''); setShowEditForm(false);
  };

  if (isLoading) return (
    <RoleGuard allowedRoles={[ROLES.ADMINISTRATOR]}>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    </RoleGuard>
  );

  if (!user) return null;

  return (
    <RoleGuard allowedRoles={[ROLES.ADMINISTRATOR]}>
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{user.username}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user.status}
            </span>
            <button
              onClick={() => isActive ? deactivateUser(id) : activateUser(id)}
              className={`text-xs px-3 py-1 rounded-lg border font-medium ${isActive ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['info', 'roles', 'activity'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Credentials</h2>
              <button onClick={() => setShowEditForm(f => !f)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                {showEditForm ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="text-gray-400">Username:</span> {user.username}</p>
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">Last login:</span> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</p>
            </div>
            {showEditForm && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <input type="email" placeholder={`New email (current: ${user.email})`} value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="New password (leave blank to keep)" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleUpdateCredentials} disabled={updating || (!editEmail.trim() && !newPassword.trim())}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Assigned Roles</h2>
            <div className="space-y-2">
              {roles.length === 0 && <p className="text-sm text-gray-500">No roles assigned.</p>}
              {roles.map((role) => (
                <div key={role.id ?? role.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{role.name}</span>
                  <button onClick={() => revokeRole({ userId: id, roleId: role.id })} disabled={revoking}
                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50">Revoke</button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Assign Role</p>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a role...</option>
                {allRoles.filter((r) => !assignedRoleIds.has(r.id)).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input type="text" placeholder="Reason for assignment" value={grantReason}
                onChange={(e) => setGrantReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleGrant} disabled={granting || !selectedRole || !grantReason.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {granting ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Admin Activity</h2>
              <p className="text-xs text-gray-500 mt-0.5">Account changes and role assignments</p>
            </div>
            {allActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No activity recorded yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {allActivity.map((e, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${e.color}`}>
                      {e.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{e.desc}</p>
                      <p className="text-xs text-gray-400 mt-0.5">by {e.by} · {new Date(e.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
