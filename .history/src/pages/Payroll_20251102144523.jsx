import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Search, WalletCards, Gift, Sigma } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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

const RESPONSE = {
  message: 'Payroll fetched successfully',
    data: {
      payroll:  [
        {
          id: 1,
          staffId: "EMP001",
          name: "John Doe",
          rank: "Captain",
          department: "Operations",
          region: "North",
          basic: 250000,
          allowance: 50000,
          net: 295000,
          status: "paid",
        },
        {
          id: 2,
          staffId: "EMP002",
          name: "Jane Smith",
          rank: "Lieutenant",
          department: "Intelligence",
          region: "West",
          basic: 200000,
          allowance: 40000,
          net: 238000,
          status: "pending",
        },
        {
          id: 3,
          staffId: "EMP003",
          name: "Michael Johnson",
          rank: "Sergeant",
          department: "Logistics",
          region: "East",
          basic: 180000,
          allowance: 35000,
          net: 205000,
          status: "paid",
        },
        {
          id: 4,
          staffId: "EMP004",
          name: "Grace Okoro",
          rank: "Major",
          department: "Finance",
          region: "South",
          basic: 300000,
          allowance: 70000,
          net: 340000,
          status: "paid",
        },
        {
          id: 5,
          staffId: "EMP005",
          name: "Samuel Obi",
          rank: "Corporal",
          department: "Communications",
          region: "Central",
          basic: 150000,
          allowance: 30000,
          net: 175000,
          status: "pending",
        },
      ],
      
      totals: {
        gross: 1_253_000,
        allowances: 225_000,
        deductions: 57_000,
     },
    }
}

export default function Payroll() {
  const navigate = useNavigate();
  const {logout} = useAuth()
  const [apiError, setApiError] = useState('');

  // Selected month (YYYY-MM)
  const now = new Date();
  const defaultYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(defaultYm);

  // Preview state
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  const [totals, setTotals] = useState({ gross: 0, allowances: 0, deductions: 0, count: 0 });

  // Search/sort
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('name'); // name | department | rank | basic | allowance | net
  const [sortDir, setSortDir] = useState('asc');

  // useEffect(() => {
  //   const fetchPreview = async () => {
  //     setApiError('');
  //     setLoading(true);

  //     try {
  //       const res = await fetch(`${API_BASE}/payroll/preview?period=${period}`, {
  //         method: 'GET',
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       if (res.status === 401) {
  //         logout()
  //         navigate('/login', { replace: true });
  //         return;
  //       }

  //       if (!res.ok) {
  //         setApiError(data?.error || 'Could not load payroll preview.');
  //         setPayrolls([]);
  //         setTotals({ gross: 0, allowances: 0, deductions: 0, count: 0 });
  //         return;
  //       }

  //       // const data = await res.json()
  //       const data = RESPONSE.data
    
  //       setPayrolls(data.payroll);
  //       setTotals({ gross: data?.totals?.gross, allowances: data?.totals?.allowances, deductions: data?.totals?.deductions, count: data?.payroll?.length });
  //     } catch {
  //       setApiError('Network error while loading preview.');
  //       setPayrolls([]);
  //       setTotals({ gross: 0, allowances: 0, deductions: 0, count: 0 });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchPreview()
  // }, [])

  useEffect(() => {
     const data = RESPONSE.data
    
    setPayrolls(data.payroll);
    setTotals({ gross: data?.totals?.gross, allowances: data?.totals?.allowances, deductions: data?.totals?.deductions, count: data?.payroll?.length });

  }, [])
  
  
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s
      ? payrolls.filter(r =>
          [r.name, r.department, r.rank, r.region, r.employeeId].some(v =>
            String(v ?? '').toLowerCase().includes(s)
          )
        )
      : payrolls;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...base].sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      const x = typeof A === 'number' ? A : String(A || '').toLowerCase();
      const y = typeof B === 'number' ? B : String(B || '').toLowerCase();
      // @ts-ignore
      return x > y ? dir : x < y ? -dir : 0;
    });
  }, [payrolls, q, sortKey, sortDir]);

  const setSort = key => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Approve payroll via API; handle overwrite if run exists
  const approve = async () => {
    if (!payrolls.length) return;

    try {
      setLoading(true);
      let res = await fetch(`${API_BASE}/payroll/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ period }),
      });
      if (res.status === 401) {
        localStorage.removeItem('ps_auth');
        navigate('/login', { replace: true });
        return;
      }
      if (res.status === 409) {
        // run exists; ask user to overwrite
        const ok = window.confirm('A payroll for this period already exists. Overwrite?');
        if (!ok) return;
        res = await fetch(`${API_BASE}/payroll/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ period, overwrite: true }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || 'Could not approve payroll.');
        return;
      }
      alert(`Payroll for ${monthLabel(period)} approved.`);
      // If you use the new PayrollHistory page:
      navigate('/history', { replace: true });
      // If you still use Reports page, switch to: navigate('/reports', { replace: true });
    } catch {
      alert('Network error. Try again.');
    } finally {
      setLoading(false);
    }
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
            onClick={approve}
            disabled={!payrolls.length || loading}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            title="Approve payroll"
          >
            <CheckCircle2 size={16} /> {loading ? 'Processing...' : 'Approve Payroll'}
          </button>
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          {apiError}
        </div>
      )}

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
          <div className="mt-1 text-xs text-black">{payrolls.length} personnel</div>
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
            placeholder="Search personnel"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-500 ml-auto">
          {filtered.length} of {payrolls.length} shown
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
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading preview…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No active personnel found.</td>
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
