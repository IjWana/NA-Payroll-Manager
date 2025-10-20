import { useMemo } from 'react';
import { useSearch } from '../context/SearchContext.jsx';
import { useStaff } from '../context/StaffContext.jsx';

// Hook: get staff filtered by global search
export function useFilteredStaff() {
  const { staff } = useStaff();
  const { debouncedQuery } = useSearch();
  const q = (debouncedQuery || '').toLowerCase();

  return useMemo(() => {
    if (!q) return staff;
    return staff.filter(s =>
      [s.name, s.role, s.department, s.email, s.employeeId]
        .some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }, [staff, q]);
}

// Component: render-prop wrapper if you prefer JSX usage
export default function FilterStaff({ children, render }) {
  const filtered = useFilteredStaff();
  if (typeof children === 'function') return children(filtered);
  if (typeof render === 'function') return render(filtered);
  return null;
}