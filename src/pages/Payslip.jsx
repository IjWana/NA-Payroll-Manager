import { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Gift,
  PercentCircle,
  RefreshCw,
  Search as SearchIcon,
  Filter,
  ChevronDown,
  MoreVertical,
  Printer
} from 'lucide-react';
import { usePayroll } from '../context/PayrollContext.jsx';

function formatCurrency(n) {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return '—';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(v);
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

function pick(val, ...keys) {
  for (const k of keys) {
    const v = val?.[k];
    if (v != null) return v;
  }
  return undefined;
}

// Normalize per-staff entry from a payroll run to support varied schemas
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
    const monthlySalary =
      pick(row, 'monthlySalary', 'basicSalary', 'gross', 'salary', 'basePay') ?? 0;
    const deductions = pick(row, 'deductions', 'totalDeductions', 'loanRepayment', 'loans', 'tax') ?? 0;
    const bonuses = pick(row, 'bonuses', 'allowances', 'bonus', 'totalAllowances') ?? 0;
    const net = pick(row, 'net', 'netPay', 'takeHome') ?? (Number(monthlySalary) - Number(deductions) + Number(bonuses));
    const payslipRaw = String(pick(row, 'payslipStatus', 'slipStatus', 'status') ?? '').toLowerCase();
    let payslipStatus = 'issued';
    if (!payslipRaw) {
      // infer from a boolean flag if present
      const issued = row.payslipIssued ?? row.issued ?? row.slipIssued;
      payslipStatus = issued ? 'issued' : 'not issued';
    } else if (payslipRaw.includes('pend')) payslipStatus = 'pending';
    else if (payslipRaw.includes('not')) payslipStatus = 'not issued';
    else payslipStatus = 'issued';

    return {
      id: row.id ?? row.employeeId ?? idx,
      name,
      monthlySalary: Number(monthlySalary || 0),
      deductions: Number(deductions || 0),
      bonuses: Number(bonuses || 0),
      net: Number(net || 0),
      payslipStatus,
    };
  });
}

function StatusPill({ value }) {
  const v = String(value || '').toLowerCase();
  const map = {
    issued: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'not issued': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const cls = map[v] || map.issued;
  const label = v === 'pending' ? 'Pending' : v === 'not issued' ? 'Not issued' : 'Issued';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>
  );
}

export default function Payslip() {
    const { runs = [] } = usePayroll();

    // Build month options from runs
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

    // Table data from selected run
    const baseRows = useMemo(() => getEntries(selectedRun), [selectedRun]);

    // Summary cards (counts, per screenshot)
    const totalGenerated = baseRows.filter(r => r.payslipStatus === 'issued').length || baseRows.length;
    const withBonuses = baseRows.filter(r => Number(r.bonuses) > 0).length;
    const withDeductions = baseRows.filter(r => Number(r.deductions) > 0).length;

    const cards = [
        {
            label: 'Total payslip generated',
            value: (totalGenerated || 0).toLocaleString(),
            desc: 'Total Workforce with payroll processing on track',
            bg: 'bg-indigo-100 border-indigo-100',
            iconBg: 'bg-indigo-600',
            Icon: FileText,
        },
        {
            label: 'Bonuses and Allowances',
            value: (withBonuses || 0).toLocaleString(),
            desc: 'Staffs Bonuses and Allowances within the month under review',
            bg: 'bg-emerald-100 border-emerald-100',
            iconBg: 'bg-emerald-600',
            Icon: Gift,
        },
        {
            label: 'Loans and Deductions',
            value: (withDeductions || 0).toLocaleString(),
            desc: 'Staffs deduction and loan repayments within the month under review',
            bg: 'bg-rose-100 border-rose-100',
            iconBg: 'bg-rose-600',
            Icon: PercentCircle,
        },
    ];

    // Local search
    const [q, setQ] = useState('');
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return baseRows;
        return baseRows.filter(r =>
            [r.name, r.monthlySalary, r.deductions, r.bonuses, r.net, r.payslipStatus]
                .some(v => String(v ?? '').toLowerCase().includes(s))
        );
    }, [baseRows, q]);

    // Sort
    const [sortKey, setSortKey] = useState('name'); // name | monthlySalary | deductions | bonuses | net | payslipStatus
    const [sortDir, setSortDir] = useState('asc');
    const setSort = (key) => {
        if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };
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
    useEffect(() => setPage(1), [sorted.length, pageSize]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const start = (page - 1) * pageSize;
    const rows = sorted.slice(start, start + pageSize);

    return (
        <div className="space-y-4">
            {/* Summary cards (icon above label) */}
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

            {/* Activities panel */}
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
                        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            className="w-52 rounded-md border pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {/* Month selector */}
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
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700"
                            title="Generate payslip"
                            onClick={() => console.log('Generate payslip for', selectedKey)}
                        >
                            <Printer size={16} /> Generate payslip
                        </button>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border p-1.5 hover:bg-gray-50"
                            title="More"
                        >
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs text-gray-500">
                            <tr>
                                <th onClick={() => setSort('name')} className="py-2 px-4 text-left cursor-pointer">Staff Name</th>
                                <th onClick={() => setSort('monthlySalary')} className="py-2 px-4 text-left cursor-pointer">Monthly Salary</th>
                                <th onClick={() => setSort('deductions')} className="py-2 px-4 text-left cursor-pointer">Deduction</th>
                                <th onClick={() => setSort('bonuses')} className="py-2 px-4 text-left cursor-pointer">Bonuses</th>
                                <th onClick={() => setSort('net')} className="py-2 px-4 text-left cursor-pointer">Net Salary</th>
                                <th onClick={() => setSort('payslipStatus')} className="py-2 px-4 text-left cursor-pointer">Payslip status</th>
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
                                    <td className="py-2 px-4">{formatCurrency(r.deductions)}</td>
                                    <td className="py-2 px-4">{formatCurrency(r.bonuses)}</td>
                                    <td className="py-2 px-4">{formatCurrency(r.net)}</td>
                                    <td className="py-2 px-4">
                                        <StatusPill value={r.payslipStatus} />
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