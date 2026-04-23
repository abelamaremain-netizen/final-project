import { forwardRef } from 'react';

interface NumberFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  allowDecimals?: boolean;
  maxDecimals?: number;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, error, helperText, allowDecimals = true, maxDecimals = 2, className = '', ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!allowDecimals && e.key === '.') {
        e.preventDefault();
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type="number"
          step={allowDecimals ? Math.pow(10, -maxDecimals) : 1}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-300' : 'border-gray-200'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

NumberField.displayName = 'NumberField';
