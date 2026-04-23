'use client';

import { useEffect } from 'react';

interface SuccessSnackbarProps {
  open?: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SuccessSnackbar({ open = true, message, onClose, duration = 5000 }: SuccessSnackbarProps) {
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-green-50 border border-green-200 rounded-md shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
        {/* Success Icon */}
        <svg
          className="h-5 w-5 text-green-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Message */}
        <p className="text-sm text-green-800 flex-1">{message}</p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-green-400 hover:text-green-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
