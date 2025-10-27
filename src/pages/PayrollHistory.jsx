import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileDown, Filter } from 'lucide-react';

const RUNS_KEY = 'ps_runs';

function loadRuns() {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function formatCurrency(n) {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return '—';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v);
  } catch {
    return '₦' + v.toLocaleString();
  }
}
function guessRunDate(r) {
  let v = r?.periodDate ?? r?.date ?? r?.createdAt ?? r?.paymentDate ?? r?.periodLabel ?? r?.period ?? r?.name;
  if (!v) return null;
  try {
    if (typeof v === 'string') {
      if (/^\d{4}-\d{2}$/.test(v)) v = `${v}-01`;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof v === 'number') return new Date(v);
    if (v instanceof Date) return v;
  } catch {}
  return null;
}
function monthKey(d) {
  return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : '';
}
function monthLabel(dOrKey) {
  if (!dOrKey) return '';
  if (typeof dOrKey === 'string' && /^\d{4}-\d{2}$/.test(dOrKey)) {
    const [y, m] = dOrKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'short', year: 'numeric' });
  }
  return dOrKey.toLocaleString(undefined, { month: 'short', year: 'numeric' });
}

export default function PayrollHistory() {
  const navigate = useNavigate();

  // Auth gate
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('ps_auth') || '{}');
      if (!auth?.token) navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const runs = loadRuns();

  // Filters
  const monthOptions = useMemo(() => {
    const set = new Set(runs.map(r => monthKey(guessRunDate(r))).filter(Boolean));
    return ['all', ...Array.from(set).sort().reverse()];
  }, [runs]);
  const [month, setMonth] = useState('all');
  const [status, setStatus] = useState('all'); // all | completed | pending | failed

  const filtered = useMemo(() => {
    const byMonth = month === 'all' ? runs : runs.filter(r => monthKey(guessRunDate(r)) === month);
    if (status === 'all') return byMonth;
    return byMonth.filter(r => String(r?.status || '').toLowerCase().includes(status));
  }, [runs, month, status]);

  // Helpers: downloads
  const downloadJSON = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    const header = ['period', 'status', 'total', 'entries'];
    const rows = filtered.map(r => {
      const d = guessRunDate(r);
      const period = monthLabel(monthKey(d)) || (r.periodLabel || r.period || '');
      const total = Number(r?.totals?.net ?? r?.totals?.gross ?? 0);
      const count = (r?.entries || r?.rows || r?.payslips || []).length;
      return [period, r.status, total, count];
    });
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const latest = filtered[0] || runs[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black">List of approved and pending payroll runs.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border px-2 py-1.5">
            <Filter size={14} className="text-gray-500" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="text-sm outline-none bg-transparent"
              title="Filter by month"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All months' : monthLabel(m)}
                </option>
              ))}
            </select>
            <span className="text-gray-300">|</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm outline-none bg-transparent"
              title="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              latest &&
              downloadJSON(
                latest,
                `payroll_${(month === 'all'
                  ? monthLabel(monthKey(guessRunDate(latest)))
                  : monthLabel(month)
                ).replace(/\s+/g, '_')}.json`
              )
            }
            disabled={!latest}
            className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
            title="Download latest report (JSON)"
          >
            <Download size={16} /> Download
          </button>
          <button
            type="button"
            onClick={exportCSV}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
            title="Export CSV"
          >
            <FileDown size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-medium text-black">Payroll Runs</h3>
            <p className="text-xs text-black">Filtered list of approved and pending runs</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-600 bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Entries</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No runs match the filter</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const d = guessRunDate(r);
                  const label = monthLabel(monthKey(d)) || (r.periodLabel || r.period || '—');
                  const total = Number(r?.totals?.net ?? r?.totals?.gross ?? 0);
                  const count = (r?.entries || r?.rows || r?.payslips || []).length;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{label}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                            String(r.status || '').toLowerCase().includes('complete')
                              ? 'bg-emerald-50 text-emerald-700'
                              : String(r.status || '').toLowerCase().includes('fail')
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {String(r.status || '—')}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium">{formatCurrency(total)}</td>
                      <td className="px-4 py-2">{count}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => downloadJSON(r, `payroll_${label.replace(/\s+/g, '_')}.json`)}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          <Download size={14} /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}