import { useMemo } from 'react';
import { useSearch } from '../context/SearchContext.jsx';
import { usePayroll } from '../context/PayrollContext.jsx';

// Hook: get payroll runs filtered by global search
export function useFilteredRuns() {
  const { runs } = usePayroll();
  const { debouncedQuery } = useSearch();
  const q = (debouncedQuery || '').toLowerCase();

  return useMemo(() => {
    if (!q) return runs;
    return runs.filter(r => {
      const fields = [
        r.period || r.periodLabel,
        r.reference || r.name,
        r.createdBy,
        r.status,
        r?.totals?.gross,
        r?.totals?.net,
      ];
      return fields.some(v => String(v ?? '').toLowerCase().includes(q));
    });
  }, [runs, q]);
}

// Component: render-prop wrapper if you prefer JSX usage
export default function FilterPayroll({ children, render }) {
  const filtered = useFilteredRuns();
  if (typeof children === 'function') return children(filtered);
  if (typeof render === 'function') return render(filtered);
  return null;
}