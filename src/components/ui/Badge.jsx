import React from 'react';
import clsx from 'clsx';

const variants = {
  default: 'bg-army-green/15 text-army-green',
  gray: 'bg-gray-200 text-gray-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export function Badge({ variant='default', className='', children }) {
  return (
    <span className={clsx('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
