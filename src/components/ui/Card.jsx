import React from 'react';

export function Card({ className='', children, ...props }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className='', children }) {
  return <div className={`p-4 border-b border-gray-100 ${className}`}>{children}</div>;
}
export function CardTitle({ className='', children }) {
  return <h3 className={`font-semibold text-gray-800 ${className}`}>{children}</h3>;
}
export function CardContent({ className='', children }) {
  return <div className={`p-4 text-sm text-gray-700 ${className}`}>{children}</div>;
}
export function CardFooter({ className='', children }) {
  return <div className={`p-4 border-t border-gray-100 ${className}`}>{children}</div>;
}
