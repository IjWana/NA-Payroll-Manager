import { useEffect, useMemo, useState } from 'react';
import { BadgeDollarSign, Gift, PercentCircle, RefreshCw, Search, Filter, SlidersHorizontal, ChevronDown, WalletCardsIcon } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext.jsx';

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
function guessRunDate(r) {
  let v = r?.periodDate ?? r?.date ?? r?.createdAt ?? r?.periodLabel ?? r?.period ?? r?.name;
  if (!v) return null;
  try {
    if (typeof v === 'string') {
      if (/^\d{4}-\d{2}$/.test(v)) v = `${v}-01`;
      const d = new Date(v);
      return isNaN(d) ? null : d;
    }
    if (typeof v === 'number') return new Date(v);
  } catch {}
  return null;
}
function labelForRun(r) {
  const lbl = r?.periodLabel || r?.period;
  if (lbl) return lbl;
  const d = guessRunDate(r);
  return d ? d.toLocaleString(undefined, { month: 'long', year: 'numeric' }) : (r?.name || 'Run');
}
function getEntries(run) {
  const list =
    run?.entries ||
    run?.items ||
    run?.payslips ||
    run?.rows ||
    run?.staffEntries ||
    [];
  return list.map((row, idx) => {
    const name = row.name || row.fullName || row.employeeName || row.staffName || 'Unnamed';
    const department = row.department || row.unit || row.dept || '';
    const rank = row.rank || row.role || row.position || '';
    const region = row.region || row.location || row.station || '';
    const salary =
      row.salaryPaid ??
      row.netPay ??
      row.net ??
      row.amount ??
      row.pay ??
      0;
    const statusRaw = String(
      row.status ?? row.paymentStatus ?? row.payStatus ?? ''
    ).toLowerCase();
    let status = 'paid';
    if (statusRaw.includes('pend')) status = 'pending';
    else if (statusRaw.includes('fail')) status = 'failed';
    else if (statusRaw.includes('process')) status = 'in-process';
    return {
      id: row.id ?? row.employeeId ?? idx,
      name,
      department,
      rank,
      region,
      salary: Number(salary || 0),
      status,
    };
  });
}
function StatusPill({ value }) {
  const v = String(value || '').toLowerCase();
  const map = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    'in-process': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  const label =
    v === 'pending' ? 'Pending' :
    v === 'failed' ? 'Failed' :
    v.includes('process') ? 'In-process' :
    'Paid';
  const cls = map[v] || map.paid;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>
  );
}

export default function Payroll() {
  const { runs = [] } = usePayroll();

  // Month selection (by run)
  const runOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    runs.forEach(r => {
      const label = labelForRun(r);
      if (!seen.has(label)) {
        seen.add(label);
        opts.push({ label, key: label, run: r });
      }
    });
    // newest first
    return opts;
  }, [runs]);

  const [selectedKey, setSelectedKey] = useState(runOptions[0]?.key || '');
  useEffect(() => {
    if (runOptions.length && !selectedKey) setSelectedKey(runOptions[0].key);
  }, [runOptions, selectedKey]);

  const selectedRun = useMemo(
    () => runOptions.find(o => o.key === selectedKey)?.run || runs[0],
    [runOptions, selectedKey, runs]
  );

  // Summary metrics for selected run
  const totals = selectedRun?.totals || {};
  const processed = Number(totals.gross ?? totals.net ?? 0);
  const bonuses = Number(totals.allowances ?? totals.bonuses ?? totals.bonus ?? 0);
  const deductions = Number(totals.deductions ?? totals.loans ?? 0);

  const cards = [
    {
      label: 'Total Payroll processed',
      value: formatCurrency(processed),
      desc: 'Total Workforce with payroll processing on track',
      bg: 'bg-indigo-100 border-indigo-200',
      iconBg: 'bg-indigo-600',
      Icon: WalletCardsIcon,
    },
    {
      label: 'Bonuses and Allowances',
      value: formatCurrency(bonuses),
      desc: 'Staffs Bonuses and Allowances within the month under review',
      bg: 'bg-emerald-100 border-emerald-200',
      iconBg: 'bg-emerald-600',
      Icon: Gift,
    },
    {
      label: 'Loans and Deductions',
      value: formatCurrency(deductions),
      desc: 'Staffs deduction and loan repayments within the month under review',
      bg: 'bg-rose-100 border-rose-200',
      iconBg: 'bg-rose-600',
      Icon: PercentCircle,
    },
  ];

  // Table data (from selected run)
  const baseRows = useMemo(() => getEntries(selectedRun), [selectedRun]);

  // Local search for activities table
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return baseRows;
    return baseRows.filter(r =>
      [r.name, r.department, r.rank, r.region, r.salary]
        .some(v => String(v ?? '').toLowerCase().includes(s))
    );
  }, [baseRows, q]);

  // Sorting
  const [sortKey, setSortKey] = useState('name'); // name | department | rank | region | salary | status
  const [sortDir, setSortDir] = useState('asc');
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [sorted.length, pageSize]); // reset on data change

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  const setSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary cards (dashed outline added here with border classes mimicking screenshot emphasis) */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {cards.map(({ label, value, desc, bg, iconBg, Icon }) => (
          <div key={label} className={`rounded-lg border ${bg} p-4`}>
            <div className="flex flex-col items-start">
              <div className={`h-8 w-8 rounded-md ${iconBg} text-white grid place-items-center`}>
                <Icon size={16} />
              </div>
              <div className="mt-2 text-xs text-gray-500">{label}</div>
              <div className="mt-3 text-2xl font-semibold">{value}</div>
              <p className="mt-2 text-xs text-gray-600">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-medium text-gray-800">Payroll Activities</h3>
          <p className="text-xs text-gray-500">Here are Staff payroll for this month</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <button
            type="button"
            title="Refresh"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="w-48 rounded-md border pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Month selector (by run) */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none rounded-md border px-3 py-1.5 pr-8 text-sm"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                title="Select month"
              >
                {runOptions.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
              title="Filter"
            >
              <Filter size={16} /> Filter
            </button>

            <button
              type="button"
              onClick={() => setSort('salary')}
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50"
              title="Sort"
            >
              <SlidersHorizontal size={16} /> Sort
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500">
              <tr>
                <th onClick={() => setSort('name')} className="py-2 px-4 text-left cursor-pointer">Staff Name</th>
                <th onClick={() => setSort('department')} className="py-2 px-4 text-left cursor-pointer">Department</th>
                <th onClick={() => setSort('rank')} className="py-2 px-4 text-left cursor-pointer">Rank</th>
                <th onClick={() => setSort('region')} className="py-2 px-4 text-left cursor-pointer">Region</th>
                <th onClick={() => setSort('salary')} className="py-2 px-4 text-left cursor-pointer">Salary Paid</th>
                <th onClick={() => setSort('status')} className="py-2 px-4 text-left cursor-pointer">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 grid place-items-center text-xs font-semibold">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800">{r.name}</p>
                        <p className="truncate text-[11px] text-gray-500">{r.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4">{r.department || '—'}</td>
                  <td className="py-2 px-4">{r.rank || '—'}</td>
                  <td className="py-2 px-4">{r.region || '—'}</td>
                  <td className="py-2 px-4">{formatCurrency(r.salary)}</td>
                  <td className="py-2 px-4">
                    <StatusPill value={r.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-sm text-gray-500">
                    No results for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              const active = n === page;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-md border ${active ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-gray-50'}`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Results per page</span>
            <select
              className="rounded-md border px-2 py-1"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
