'use client';

import { useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useGetDocumentsByEntityQuery, useUploadDocumentMutation, useDeleteDocumentMutation } from '../documentsApi';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toastSuccess, toastError } from '@/components/common/Toast';
import type { DocumentMeta } from '@/types';

const DOCUMENT_TYPES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'ID_COPY', label: 'ID Copy' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'APPRAISAL', label: 'Appraisal Report' },
  { value: 'EMPLOYMENT_LETTER', label: 'Employment Letter' },
  { value: 'COLLATERAL_PROOF', label: 'Collateral Proof' },
  { value: 'LOAN_APPLICATION', label: 'Loan Application' },
  { value: 'OTHER', label: 'Other' },
];

interface Props {
  entityType: string;
  entityId: string;
  canDelete?: boolean;
}

export function DocumentManager({ entityType, entityId, canDelete = false }: Props) {
  const { data: documents = [], isLoading, refetch } = useGetDocumentsByEntityQuery({ entityType, entityId });
  const [uploadDocument, { isLoading: uploading }] = useUploadDocumentMutation();
  const [deleteDocument, { isLoading: deleting }] = useDeleteDocumentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('GENERAL');
  const [deleteTarget, setDeleteTarget] = useState<DocumentMeta | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', selectedDocType);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    try {
      await uploadDocument(formData).unwrap();
      toastSuccess('Document uploaded');
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to upload document');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument(deleteTarget.id).unwrap();
      toastSuccess('Document deleted');
      setDeleteTarget(null);
      refetch();
    } catch (e: any) {
      toastError(e?.data?.message ?? 'Failed to delete document');
      setDeleteTarget(null);
    }
  };

  // Fetch with Authorization header, create a blob URL — avoids 401 from bare anchor tag
  const handleDownload = async (doc: DocumentMeta) => {
    setDownloading(doc.id);
    try {
      const token = localStorage.getItem('token');
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
      const res = await fetch(`${base}/api/documents/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toastError('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) return <div className="flex justify-center py-4"><CircularProgress size={20} /></div>;

  return (
    <div className="space-y-3">
      {/* Header + upload controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-semibold text-gray-600">Documents ({documents.length})</p>
        <div className="flex items-center gap-2">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            {DOCUMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
            {uploading ? <CircularProgress size={12} color="inherit" /> : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            Upload
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {documents.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No documents uploaded.</p>
      )}

      {documents.map((doc: DocumentMeta) => (
        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">{doc.documentName}</p>
            <p className="text-xs text-gray-500">
              {doc.documentType} · {formatSize(doc.fileSize)}
              {doc.uploadDate && (
                <span className="ml-2 text-gray-400">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => handleDownload(doc)}
              disabled={downloading === doc.id}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50"
              title="Download"
            >
              {downloading === doc.id
                ? <CircularProgress size={14} />
                : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )
              }
            </button>
            {canDelete && (
              <button
                onClick={() => setDeleteTarget(doc)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Document"
          message={`Delete "${deleteTarget.documentName}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
