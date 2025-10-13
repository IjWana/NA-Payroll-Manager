import React from 'react';
import clsx from 'clsx';

const base = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-army-green/50 disabled:opacity-50 disabled:cursor-not-allowed';
const variants = {
  primary: 'bg-army-green text-white hover:bg-army-green/90',
  secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100',
  outline: 'border border-army-green text-army-green hover:bg-army-green/10',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};
const sizes = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-6 text-base',
};

export function Button({ variant='primary', size='md', className, children, ...props }) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
