import React from 'react';

export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 divide-y divide-gray-200 bg-white">{children}</table>
    </div>
  );
}
export function THead({ children }) { return <thead className="bg-gray-50 text-xs uppercase text-gray-600">{children}</thead>; }
export function TBody({ children }) { return <tbody className="divide-y divide-gray-100 text-sm">{children}</tbody>; }
export function TR({ children }) { return <tr className="hover:bg-gray-50">{children}</tr>; }
export function TH({ className='', children }) { return <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>; }
export function TD({ className='', children }) { return <td className={`px-3 py-2 ${className}`}>{children}</td>; }
