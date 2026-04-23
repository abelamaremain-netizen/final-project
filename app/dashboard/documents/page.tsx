'use client';

import { useState } from 'react';
import { DocumentManager } from '@/features/documents/components/DocumentManager';
import { MemberSearchInput } from '@/components/common/MemberSearchInput';

const entityTypes = [
  { value: 'LOAN', label: 'Loan' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'COLLATERAL', label: 'Collateral' },
  { value: 'LOAN_APPLICATION', label: 'Loan Application' },
];

export default function DocumentsPage() {
  const [entityType, setEntityType] = useState('LOAN');
  const [entityId, setEntityId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (entityId.trim()) setSubmitted(true);
  };

  const inputCls = 'px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload and manage documents for loans, members, and collateral.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setSubmitted(false); setEntityId(''); }}
              className={inputCls}
            >
              {entityTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Entity ID (UUID)</label>
            <input
              value={entityId}
              onChange={(e) => { setEntityId(e.target.value); setSubmitted(false); }}
              placeholder="Paste UUID here…"
              className={`${inputCls} w-72`}
            />
          </div>
          <button
            type="submit"
            disabled={!entityId.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Load Documents
          </button>
          {submitted && (
            <button
              type="button"
              onClick={() => { setSubmitted(false); setEntityId(''); }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {submitted && entityId.trim() ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 font-mono mb-4">
            {entityType} / {entityId}
          </p>
          <DocumentManager entityType={entityType} entityId={entityId.trim()} canDelete={true} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Select an entity type and enter an ID to view documents.</p>
        </div>
      )}
    </div>
  );
}
