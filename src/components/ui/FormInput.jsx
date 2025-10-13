import React from 'react';

export function FormInput({ label, className='', error, ...props }) {
  return (
    <label className="block text-sm mb-3">
      <span className="block font-medium text-gray-700 mb-1">{label}</span>
      <input
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-army-green focus:border-army-green bg-white ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
