import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, RefreshCw, Search, WalletCards, Gift, Sigma } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STAFF_KEY = 'ps_staff';
const RUNS_KEY = 'ps_runs';

function loadStaff() {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function loadRuns() {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveRuns(runs) {
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
  } catch {}
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
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
function initials(name = '') {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || 'NA';
}
function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

export default function Payroll() {
  const navigate = useNavigate();

  // Auth guard (simple)
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('ps_auth') || '{}');
      if (!auth?.token) navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Selected month (YYYY-MM)
  const now = new Date();
  const defaultYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(defaultYm);

  // Fetch active personnel
  const allPersonnel = loadStaff();
  const personnel = useMemo(
    () =>
      allPersonnel.filter(
        s => String(s?.status || 'Active').toLowerCase() === 'active'
      ),
    [allPersonnel]
  );

  // Build preview entries (auto compute allowance as stored allowance or 10% of basic)
  const entries = useMemo(() => {
    return personnel.map((s, idx) => {
      const basic = Number(s.basicSalary || 0);
      const allowance = Number.isFinite(Number(s.allowance))
        ? Number(s.allowance)
        : Math.round(basic * 0.1);
      const net = basic + allowance;
      return {
        id: s.id || idx,
        employeeId: s.employeeNo || s.id || String(idx),
        name: s.fullName || 'Unnamed',
        rank: s.rank || '',
        department: s.department || '',
        region: s.region || '',
        basic,
        allowance,
        net,
        status: 'pending',
      };
    });
  }, [personnel]);

  // Totals
  const totals = useMemo(() => {
    const gross = entries.reduce((n, r) => n + r.net, 0);
    const allowances = entries.reduce((n, r) => n + r.allowance, 0);
    return { gross, allowances, deductions: 0, count: entries.length };
  }, [entries]);

  // Search/sort
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('name'); // name | department | rank | basic | allowance | net
  const [sortDir, setSortDir] = useState('asc');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s
      ? entries.filter(r =>
          [r.name, r.department, r.rank, r.region, r.employeeId].some(v =>
            String(v ?? '').toLowerCase().includes(s)
          )
        )
      : entries;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...base].sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      const x = typeof A === 'number' ? A : String(A || '').toLowerCase();
      const y = typeof B === 'number' ? B : String(B || '').toLowerCase();
      // @ts-ignore
      return x > y ? dir : x < y ? -dir : 0;
    });
  }, [entries, q, sortKey, sortDir]);

  const setSort = key => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Approve payroll -> save to history and navigate to Reports
  const approve = () => {
    if (!entries.length) return;
    const runs = loadRuns();

    // prevent duplicate approval for same period
    const label = monthLabel(period);
    const exists = runs.some(r => r.period === period || r.periodLabel === label);
    if (exists && !window.confirm('A payroll for this period already exists. Overwrite?')) {
      return;
    }

    const run = {
      id: uid(),
      period, // YYYY-MM
      periodLabel: label,
      status: 'completed',
      createdAt: new Date().toISOString(),
      totals,
      entries: entries.map(e => ({
        id: e.id,
        staffId: e.employeeId,
        name: e.name,
        department: e.department,
        rank: e.rank,
        region: e.region,
        salaryPaid: e.net,
        allowance: e.allowance,
        status: 'paid',
      })),
    };

    const next = exists
      ? runs.map(r => (r.period === period || r.periodLabel === label ? run : r))
      : [run, ...runs];

    saveRuns(next);
    // Optional: add a simple "report" record to documents storage
    try {
      const docsKey = 'ps_docs';
      const arr = JSON.parse(localStorage.getItem(docsKey) || '[]');
      arr.unshift({
        id: uid(),
        title: `Payroll - ${label}`,
        type: 'Report',
        status: 'outbox',
        createdAt: new Date().toISOString(),
        size: `${(JSON.stringify(run).length / 1024).toFixed(1)} KB`,
      });
      localStorage.setItem(docsKey, JSON.stringify(arr));
    } catch {}

    alert(`Payroll for ${label} approved.`);
    navigate('/reports', { replace: true });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black">Select period, review computed totals, then approve to save to history.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor="period">Payroll month</label>
            <input
              id="period"
              type="month"
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="rounded-md border px-3 py-1.5 text-sm"
            />
            <Calendar className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button
            type="button"
            onClick={() => setQ('')}
            className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            type="button"
            onClick={approve}
            disabled={!entries.length}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            title="Approve payroll"
          >
            <CheckCircle2 size={16} /> Approve Payroll
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4 bg-indigo-200 border-indigo-100">
          <div className="h-8 w-8 grid place-items-center rounded-md bg-indigo-600 text-white">
            <WalletCards size={16} />
          </div>
          <div className="mt-2 text-sm text-black">Total Payroll Amount</div>
          <div className="mt-2 text-2xl font-semibold">{formatCurrency(totals.gross)}</div>
          <div className="mt-1 text-xs text-black">{monthLabel(period)}</div>
        </div>
        <div className="rounded-lg border p-4 bg-emerald-200 border-emerald-100">
          <div className="h-8 w-8 grid place-items-center rounded-md bg-emerald-600 text-white">
            <Gift size={16} />
          </div>
          <div className="mt-2 text-sm text-black">Total Allowances</div>
          <div className="mt-2 text-2xl font-semibold">{formatCurrency(totals.allowances)}</div>
          <div className="mt-1 text-xs text-black">{entries.length} personnel</div>
        </div>
        <div className="rounded-lg border p-4 bg-indigo-200 border-gray-200">
          <div className="h-8 w-8 grid place-items-center rounded-md bg-gray-700 text-white">
            <Sigma size={16} />
          </div>
          <div className="mt-2 text-sm text-black">Deductions</div>
          <div className="mt-2 text-2xl font-semibold">{formatCurrency(totals.deductions)}</div>
          <div className="mt-1 text-xs text-black">Loans and other deductions</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-xs text-gray-500">Status</div>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs">
              Draft preview
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Approve when ready. This will save to history and appear in Reports.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="w-64 rounded-md border pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search soldiers"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-500 ml-auto">
          {filtered.length} of {entries.length} shown
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-600 bg-gray-50">
            <tr className="text-left">
              <th className="py-2 px-4 cursor-pointer" onClick={() => setSort('name')}>Personnel</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setSort('department')}>Department</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setSort('rank')}>Rank</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setSort('basic')}>Basic Salary</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setSort('allowance')}>Allowance</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setSort('net')}>Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No active soldiers found.</td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 grid place-items-center text-xs font-semibold">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800">{r.name}</p>
                        <p className="truncate text-[11px] text-gray-500">{r.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4">{r.department || '—'}</td>
                  <td className="py-2 px-4">{r.rank || '—'}</td>
                  <td className="py-2 px-4">{formatCurrency(r.basic)}</td>
                  <td className="py-2 px-4">{formatCurrency(r.allowance)}</td>
                  <td className="py-2 px-4 font-medium">{formatCurrency(r.net)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
