'use client';

import { MemberForm } from '@/features/members/components/MemberForm';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { ROLES } from '@/constants/app';

export default function NewMemberPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.MEMBER_OFFICER]}>
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Create New Member</h1>
          <p className="text-sm text-gray-600 mt-1">Register a new member in the cooperative</p>
        </div>
        <MemberForm />
      </div>
    </RoleGuard>
  );
}
