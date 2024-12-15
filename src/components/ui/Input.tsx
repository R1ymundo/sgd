import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full rounded-md bg-gray-700 border-gray-600 text-gray-100',
          'placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500',
          'shadow-sm transition-colors',
          { 'border-red-500': error },
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}