import { useMemo } from 'react';
import {
  BadgeDollarSign,
  Timer,
  CheckCircle2,
  AlertOctagon,
  Download,
  WalletCardsIcon,
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
function percent(n, d) {
  if (!d) return 0;
  const p = Math.round((Number(n) / Number(d)) * 100);
  return Number.isFinite(p) ? p : 0;
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
function monthLabel(d) {
  return d ? d.toLocaleString(undefined, { month: 'short' }) : '';
}
function pick(val, ...keys) {
  for (const k of keys) {
    const v = val?.[k];
    if (v != null) return v;
  }
  return undefined;
}

// Normalize entries from a run (for department sums)
function getEntries(run) {
  const list =
    run?.entries ||
    run?.items ||
    run?.payslips ||
    run?.rows ||
    run?.staffEntries ||
    [];
  return list.map((row, i) => {
    const department = row.department || row.unit || row.dept || 'Unassigned';
    const net =
      Number(pick(row, 'net', 'netPay', 'takeHome')) ||
      Number(pick(row, 'gross', 'monthlySalary', 'basicSalary', 'salary', 'basePay')) ||
      0;
    return { id: row.id ?? row.employeeId ?? i, department: String(department || 'Unassigned'), amount: Number(net || 0) };
  });
}

// Bar chart (monthly totals)
function ExpenseBars({ data, labels, highlightIndex = 2 }) {
  const max = Math.max(...data.map(v => Number(v) || 0), 1);
  return (
    <svg viewBox={`0 0 ${labels.length * 60} 220`} className="w-full h-[220px]">
      <defs>
        <linearGradient id="g-exp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="2" opacity="0.25" />
        </pattern>
      </defs>
      {labels.map((m, i) => {
        const h = Math.round(((Number(data[i]) || 0) / max) * 160) + 8;
        const x = i * 60 + 20;
        const y = 190 - h;
        const highlight = i === highlightIndex;
        return (
          <g key={m}>
            {!highlight && <rect x={x} y={30} width="20" height="160" rx="10" fill="url(#hatch)" />}
            <rect x={x} y={y} width="20" height={h} rx="10" fill={highlight ? 'url(#g-exp)' : '#e2e8f0'} />
            <text x={x + 10} y={210} textAnchor="middle" fontSize="10" fill="#64748b">{m}</text>
            {highlight && (
              <g transform={`translate(${x - 10}, ${y - 60})`}>
                <rect x="0" y="0" width="120" height="52" rx="6" fill="#0f172a" opacity="0.95" />
                <g transform="translate(8,8)" fontSize="10" fill="#e2e8f0">
                  <text x="0" y="10">• Base Salary  {formatCurrency((Number(data[i]) || 0) * 0.8)}</text>
                  <text x="0" y="24">• Allowances   {formatCurrency((Number(data[i]) || 0) * 0.5)}</text>
                  <text x="0" y="38">• Arrears      {formatCurrency((Number(data[i]) || 0) * 0.1)}</text>
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Donut chart by department
function DonutChart({ items, total, centerLabel }) {
  // items: [{label, value, color}]
  const r = 60;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <svg viewBox="0 0 160 160" className="w-full h-[180px]">
        <g transform="translate(80,80) rotate(-90)">
          <circle r={r} cx="0" cy="0" fill="none" stroke="#e5e7eb" strokeWidth="18" />
          {items.map((it, idx) => {
            const frac = total ? (it.value / total) : 0;
            const dash = Math.max(0.0001, frac * c);
            const offset = c - acc;
            acc += dash;
            return (
              <circle
                key={idx}
                r={r}
                cx="0"
                cy="0"
                fill="none"
                stroke={it.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            );
          })}
        </g>
        <text x="80" y="78" textAnchor="middle" fontSize="10" fill="#6b7280">{centerLabel}</text>
        <text x="80" y="98" textAnchor="middle" fontSize="14" fontWeight="600" fill="#111827">
          {formatCurrency(total)}
        </text>
      </svg>

      <ul className="space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.color }} />
              {it.label}
            </span>
            <span className="text-gray-600">{formatCurrency(it.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Reports() {
  const { runs = [] } = usePayroll();

  const latest = runs[0];
  const totalsLatest = latest?.totals || {};
  const processedTotal = Number(totalsLatest.net ?? totalsLatest.gross ?? 0);

  // KPI metrics from runs
  const runStatuses = runs.map(r => String(r?.status || '').toLowerCase());
  const completedRuns = runStatuses.filter(s => s.includes('complete')).length;
  const failedRuns = runStatuses.filter(s => s.includes('fail')).length;
  const onTimeRate = percent(completedRuns, runs.length);
  const errorRate = percent(failedRuns, runs.length);

  // Payslip accuracy (issued vs total from latest run entries if available)
  const entriesLatest = useMemo(() => (latest ? getEntries(latest) : []), [latest]);
  const payslipIssued =
    (latest?.entries || latest?.payslips || latest?.rows || [])
      .filter(e => {
        const raw = String(pick(e, 'payslipStatus', 'slipStatus', 'status') ?? '').toLowerCase();
        const issuedFlag = e.payslipIssued ?? e.issued ?? e.slipIssued;
        return raw.includes('issued') || (!!issuedFlag && raw !== 'not issued');
      }).length;
  const payslipAccuracy = entriesLatest.length ? percent(payslipIssued, entriesLatest.length) : onTimeRate;

  const kpiCards = [
    {
      label: 'Total payment processed',
      value: processedTotal ? formatCurrency(processedTotal) : '—',
      foot: runs.length ? `${percent(completedRuns, runs.length)}% completed for this month` : '—',
      bg: 'bg-amber-100 border-amber-100',
      iconBg: 'bg-amber-500 text-amber-700',
      Icon: WalletCardsIcon,
    },
    {
      label: 'Payroll on time rate',
      value: `${onTimeRate}%`,
      foot: runs.length ? 'Based on completed runs' : '—',
      bg: 'bg-indigo-100 border-indigo-100',
      iconBg: 'bg-indigo-500 text-indigo-700',
      Icon: Timer,
    },
    {
      label: 'Payslip Accuracy',
      value: `${payslipAccuracy}%`,
      foot: entriesLatest.length ? 'Payslips generated and sent correctly' : '—',
      bg: 'bg-emerald-100 border-emerald-100',
      iconBg: 'bg-emerald-500 text-emerald-700',
      Icon: CheckCircle2,
    },
    {
      label: 'Payroll error Rate',
      value: `${errorRate}%`,
      foot: 'Percentage of payroll transactions with Error',
      bg: 'bg-rose-100 border-rose-100',
      iconBg: 'bg-rose-500 text-rose-700',
      Icon: AlertOctagon,
    },
  ];

  // Monthly expense series (use net totals grouped by month)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlySeries = useMemo(() => {
    if (!runs.length) return months.slice(0, 9).map(() => 0);
    const map = new Map();
    runs.forEach(r => {
      const d = guessRunDate(r);
      const key = monthKey(d);
      const val = Number(r?.totals?.net ?? r?.totals?.gross ?? 0);
      map.set(key, (map.get(key) || 0) + val);
    });
    // take Jan–Sep or the first 9 labels of the year with data
    const byMonth = months.slice(0, 9).map((m, idx) => {
      const year = new Date().getFullYear();
      const key = `${year}-${String(idx + 1).padStart(2, 0)}`;
      return map.get(key) || 0;
    });
    return byMonth;
  }, [runs]);

  // Department donut from latest run
  const deptAgg = useMemo(() => {
    const agg = new Map();
    entriesLatest.forEach(e => agg.set(e.department, (agg.get(e.department) || 0) + (e.amount || 0)));
    // fallback demo colors; order by value desc and take top 1006
    const palette = ['#f59e0b', '#6366f1', '#22c55e', '#ef4444', '#a855f7', '#8b5cf6'];
    const sorted = Array.from(agg.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const items = sorted.map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    return { items, total };
  }, [entriesLatest]);

  // Bottom quick stats
  const totalPayrollAmount = monthlySeries.reduce((s, v) => s + v, 0);
  const highest = useMemo(() => {
    if (!deptAgg.items.length) return null;
    const top = [...deptAgg.items].sort((a, b) => b.value - a.value)[0];
    const pct = percent(top.value, deptAgg.total);
    return { label: top.label, pct };
  }, [deptAgg]);
  const lowest = useMemo(() => {
    if (!deptAgg.items.length) return null;
    const nonZero = deptAgg.items.filter(i => i.value > 0);
    const bot = (nonZero.length ? nonZero : deptAgg.items).sort((a, b) => a.value - b.value)[0];
    const pct = percent(bot.value, deptAgg.total);
    return { label: bot.label, pct };
  }, [deptAgg]);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        {kpiCards.map(({ label, value, foot, bg, iconBg, Icon }) => (
          <div key={label} className={`rounded-lg border ${bg} p-4`}>
            <div className="flex flex-col items-start">
              <div className={`h-8 w-8 rounded-md ${iconBg} flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <div className="mt-2 text-xs text-gray-500">{label}</div>
              <div className="mt-3 text-2xl font-semibold">{value}</div>
              <div className="mt-2 inline-flex items-center rounded px-2 py-1 text-[11px] bg-white/50 text-gray-700">
                {foot}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Expense Breakdown (left) with summaries below */}
        <div className="xl:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Payroll Expense Breakdown</h3>
              <p className="text-xs text-gray-500">Here is a graph of payroll expenses breakdown</p>
            </div>
            <button className="rounded-md border p-2 hover:bg-gray-50" title="Download">
              <Download size={16} />
            </button>
          </div>
          <div className="mt-4">
            <ExpenseBars data={monthlySeries} labels={months.slice(0, 9)} />
          </div>

          {/* Moved summary tiles here to align under the breakdown */}
          <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Total payroll Amount</div>
              <div className="mt-2 text-lg font-semibold text-emerald-700">{formatCurrency(totalPayrollAmount)}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Highest-paid department</div>
              <div className="mt-2 text-sm">
                {highest ? <span className="font-semibold text-gray-800">{highest.label}</span> : '—'}{' '}
                <span className="text-emerald-700">({highest ? `${highest.pct}%` : '—'})</span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Lowest-paid department</div>
              <div className="mt-2 text-sm">
                {lowest ? <span className="font-semibold text-gray-800">{lowest.label}</span> : '—'}{' '}
                <span className="text-rose-700">({lowest ? `${lowest.pct}%` : '—'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Pie Chart (right) */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-800">Salary Pie Chart</h3>
            <p className="text-xs text-gray-500">This is the Chart for Department Salary</p>
          </div>
          <DonutChart items={deptAgg.items} total={deptAgg.total} centerLabel="Total" />
        </div>
      </div>

      {/* Removed separate bottom summary tiles (now shown under the breakdown) */}
    </div>
  );
}
