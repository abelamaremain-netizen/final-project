'use client';

import { useState } from 'react';
import { useCreateUserMutation, useGetAllRolesQuery } from '@/features/users/usersApi';
import type { CreateUserDto } from '@/types';
import { VALIDATION } from '@/constants/app';

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  roles: string[];
}

export function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: rolesData = [] } = useGetAllRolesQuery();
  const [form, setForm] = useState<FormState>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    roles: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.username.trim() || form.username.length < 3) next.username = 'Username must be at least 3 characters';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Invalid email format';
    if (form.password.length < VALIDATION.MIN_PASSWORD_LENGTH)
      next.password = `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    if (form.roles.length === 0) next.roles = 'At least one role must be assigned';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    try {
      await createUser({
        username: form.username,
        email: form.email,
        password: form.password,
        roles: form.roles,
      } as any).unwrap();
      onSuccess?.();
    } catch {
      setServerError('Failed to create user. Username or email may already exist.');
    }
  };

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const textField = (label: string, key: keyof FormState, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[key] ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {errors[key] && <p className="text-xs text-red-600 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {textField('Username', 'username')}
      {textField('Email', 'email', 'email')}
      {textField('Password', 'password', 'password')}
      {textField('Confirm Password', 'confirmPassword', 'password')}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="grid grid-cols-2 gap-2">
          {rolesData.map((role) => (
            <label key={role.name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.roles.includes(role.name)}
                onChange={() => toggleRole(role.name)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{role.name}</span>
            </label>
          ))}
        </div>
        {errors.roles && <p className="text-xs text-red-600 mt-1">{errors.roles}</p>}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
