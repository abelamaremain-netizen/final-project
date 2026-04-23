'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLazySearchMembersQuery } from '@/features/members/membersApi';
import type { Member } from '@/types';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string; // controlled selected member id
  onChange: (memberId: string, member: Member | null) => void;
  className?: string;
  error?: string;
}

export function MemberSearchInput({
  label,
  placeholder = 'Search by name or member number...',
  value,
  onChange,
  className = '',
  error,
}: Props) {
  const [query, setQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchMembers, { data: results = [], isFetching }] = useLazySearchMembersQuery();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Clear selection if parent resets value to empty
  useEffect(() => {
    if (!value) {
      setSelectedMember(null);
      setQuery('');
    }
  }, [value]);

  const handleInput = useCallback((val: string) => {
    setQuery(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => searchMembers(val), 300);
    }
  }, [searchMembers]);

  const handleSelect = (member: Member) => {
    setSelectedMember(member);
    setQuery('');
    setOpen(false);
    onChange(member.id, member);
  };

  const handleClear = () => {
    setSelectedMember(null);
    setQuery('');
    onChange('', null);
  };

  const inputCls = `w-full px-3 py-2 rounded-lg bg-white/60 backdrop-blur-sm border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all ${
    error ? 'border-red-400' : 'border-white/40 focus:border-blue-400/50'
  }`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}

      {selectedMember ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 border border-purple-200">
          <div>
            <span className="text-sm font-medium text-purple-900">
              {selectedMember.firstName} {selectedMember.lastName}
            </span>
            <span className="ml-2 text-xs text-purple-500">{selectedMember.nationalId}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-purple-400 hover:text-purple-700 ml-2"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder={placeholder}
            className={inputCls}
          />
          {isFetching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Searching...
            </span>
          )}
        </div>
      )}

      {open && results.length > 0 && !selectedMember && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-52 overflow-y-auto">
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(m)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <span className="font-medium text-gray-900">{m.firstName} {m.lastName}</span>
              <span className="ml-2 text-xs text-gray-500">{m.nationalId}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !isFetching && results.length === 0 && !selectedMember && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 text-sm text-gray-400">
          No members found
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
