interface ErrorAlertProps {
  error?: any;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, message, onRetry, onDismiss }: ErrorAlertProps) {
  const errorMessage = message || error?.data?.message || error?.message || 'An error occurred';
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <svg
          className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-red-700 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
