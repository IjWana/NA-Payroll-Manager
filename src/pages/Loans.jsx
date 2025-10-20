import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Hourglass,
  AlertTriangle,
  ReceiptText,
  CalendarDays,
  Filter,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';
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
function pick(val, ...keys) {
  for (const k of keys) {
    const v = val?.[k];
    if (v != null) return v;
  }
  return undefined;
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

// Normalize per-staff loan row from a payroll run
function getLoanEntries(run) {
  const list =
    run?.entries ||
    run?.items ||
    run?.payslips ||
    run?.rows ||
    run?.staffEntries ||
    [];

  return list.map((row, idx) => {
    const name = row.name || row.fullName || row.employeeName || row.staffName || 'Unnamed';
    const monthlySalary =
      pick(row, 'monthlySalary', 'basicSalary', 'gross', 'salary', 'basePay') ?? 0;

    // Loan deduction and metadata
    const loan = Number(
      pick(
        row,
        'loanDeduction',
        'loan',
        'loanRepayment',
        'loanPayment',
        'loanAmountDue',
        'loans',
        'deductions' // fallback if only total is present
      ) ?? 0
    );
    const loanType =
      pick(row, 'loanType', 'type', 'loan_kind', 'loanCategory') ||
      (loan ? 'DNPL Loan' : '');

    // Status (Approved | Pending | Failed)
    const rawStatus = String(pick(row, 'loanStatus', 'status', 'payslipStatus', 'payStatus') || '').toLowerCase();
    let status = 'approved';
    if (rawStatus.includes('pend')) status = 'pending';
    else if (rawStatus.includes('fail')) status = 'failed';
    else if (!rawStatus && loan > 0) status = 'approved';

    // Due date inference
    const due =
      pick(row, 'dueDate', 'loanDueDate', 'repaymentDueDate', 'nextDueDate', 'expectedPaymentDate') ||
      run?.paymentDate ||
      run?.dates?.payment;

    return {
      id: row.id ?? row.employeeId ?? idx,
      name,
      monthlySalary: Number(monthlySalary || 0),
      deduction: loan,
      type: loanType,
      status,
      dueDate: due ? new Date(due) : null,
    };
  });
}

function StatusPill({ value }) {
  const v = String(value || '').toLowerCase();
  const map = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const label = v === 'pending' ? 'Pending' : v === 'failed' ? 'Failed' : 'Approved';
  const cls = map[v] || map.approved;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>;
}

export default function Loans() {
  const { runs = [] } = usePayroll();

  // Build run (month) options
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

  // Rows from the selected run
  const baseRows = useMemo(() => getLoanEntries(selectedRun), [selectedRun]);

  // KPIs
  const totalFiled = baseRows.filter(r => r.deduction > 0).length;
  const pendingLoans = baseRows.filter(r => r.status === 'pending').length;
  const today = new Date();
  const overdueLoans = baseRows.filter(r => r.deduction > 0 && r.dueDate && r.dueDate < today && r.status !== 'approved').length;
  const totalLoanDeduction = baseRows.reduce((sum, r) => sum + (r.deduction || 0), 0);

  const cards = [
    {
      label: 'Total Loan Filed',
      value: (totalFiled || 0).toLocaleString(),
      desc: 'Successful loan filing',
      bg: 'bg-emerald-100 border-emerald-200',
      iconBg: 'bg-emerald-600',
      Icon: Banknote,
    },
    {
      label: 'Total pending Loans',
      value: (pendingLoans || 0).toLocaleString(),
      desc: 'Loans yet to be processed',
      bg: 'bg-amber-100 border-amber-200',
      iconBg: 'bg-amber-600',
      Icon: Hourglass,
    },
    {
      label: 'Overdue Loan payment',
      value: (overdueLoans || 0).toLocaleString(),
      desc: 'Compliance for Loans overdue',
      bg: 'bg-rose-100 border-rose-200',
      iconBg: 'bg-rose-600',
      Icon: AlertTriangle,
    },
    {
      label: 'Total Loan Deduction',
      value: formatCurrency(totalLoanDeduction),
      desc: 'Loans deducted from Salaries',
      bg: 'bg-indigo-100 border-indigo-200',
      iconBg: 'bg-indigo-600',
      Icon: ReceiptText,
    },
  ];

  // Sorting + pagination for table
  const [sortKey, setSortKey] = useState('name'); // name | monthlySalary | deduction | type | status | dueDate
  const [sortDir, setSortDir] = useState('asc');
  const setSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...baseRows];
    arr.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      const aVal = A instanceof Date ? A.getTime() : A;
      const bVal = B instanceof Date ? B.getTime() : B;
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [baseRows, sortKey, sortDir]);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [sorted.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  return (
    <div className="space-y-4">
      {/* KPI cards (icon above label) */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-4">
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

      {/* Loan Repayment List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-medium text-gray-800">Loan Repayment List</h3>
          <p className="text-xs text-gray-500">Here is the Loan repayment details list</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50">
            <MoreVertical size={16} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Month/run selector */}
            <div className="relative">
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm">
                <CalendarDays size={16} />
                <span>{selectedKey || 'Select period'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {/* Native select overlaid for accessibility */}
              <select
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                title="Select period"
              >
                {runOptions.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>

            <button type="button" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500">
              <tr className="text-left">
                <th onClick={() => setSort('name')} className="py-2 px-4 cursor-pointer">Staff Name</th>
                <th onClick={() => setSort('monthlySalary')} className="py-2 px-4 cursor-pointer">Monthly Salary</th>
                <th onClick={() => setSort('deduction')} className="py-2 px-4 cursor-pointer">Deduction</th>
                <th onClick={() => setSort('type')} className="py-2 px-4 cursor-pointer">Type</th>
                <th onClick={() => setSort('status')} className="py-2 px-4 cursor-pointer">Payslip status</th>
                <th onClick={() => setSort('dueDate')} className="py-2 px-4 cursor-pointer">Due Date</th>
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
                  <td className="py-2 px-4">{formatCurrency(r.monthlySalary)}</td>
                  <td className="py-2 px-4">{formatCurrency(r.deduction)}</td>
                  <td className="py-2 px-4">{r.type || '—'}</td>
                  <td className="py-2 px-4"><StatusPill value={r.status} /></td>
                  <td className="py-2 px-4">
                    {r.dueDate && !isNaN(r.dueDate) ? r.dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-sm text-gray-500">No loan records for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 rounded-md border disabled:opacity-50"
              aria-label="Previous page"
            >
              ‹
            </button>
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
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-md border disabled:opacity-50"
              aria-label="Next page"
            >
              ›
            </button>
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