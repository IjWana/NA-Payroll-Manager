import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet2, PercentCircle, Download, Settings2, WalletIcon } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext.jsx';
import { useStaff } from '../context/StaffContext.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';

function formatCurrency(n) {
  if (n == null || Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
  } catch {
    return '₦' + Number(n).toLocaleString();
  }
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || 'NA';
}

// Simple SVG bar chart with gradient + hatch pattern (static tooltip mimic)
function ExpenseBars({ labels, series, highlightIndex = -1 }) {
  // series: [{ label, data: number[], color }]
  const totalsByMonth = labels.map((_, i) =>
    series.reduce((sum, s) => sum + (Number(s.data[i]) || 0), 0)
  );
  const max = Math.max(...totalsByMonth, 1);

  return (
    <svg viewBox={`0 0 ${labels.length * 60} 220`} className="w-full h-[220px]">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="2" opacity="0.25" />
        </pattern>
      </defs>

      {labels.map((m, i) => {
        const x = i * 60 + 20;
        const total = totalsByMonth[i];
        const isHighlight = i === highlightIndex;

        // stacked segments from bottom up
        let cursorY = 190;
        const segments = series.map(s => {
          const val = Number(s.data[i]) || 0;
          const h = Math.round((val / max) * 160);
          cursorY -= h;
          return { x, y: cursorY, h, color: s.color, label: s.label, val };
        });

        const topY = Math.min(...segments.map(s => s.y));

        return (
          <g key={m}>
            {/* background hatched pillar for non-highlight months */}
            {!isHighlight && <rect x={x} y={30} width="20" height="160" rx="10" fill="url(#hatch)" />}
            {segments.map((seg, k) =>
              seg.h > 0 ? (
                <rect
                  key={k}
                  x={seg.x}
                  y={seg.y}
                  width="20"
                  height={seg.h}
                  rx={k === segments.length - 1 ? 10 : 0}
                  ry={k === segments.length - 1 ? 10 : 0}
                  fill={seg.color}
                />
              ) : null
            )}
            <text x={x + 10} y={210} textAnchor="middle" fontSize="10" fill="#64748b">
              {m}
            </text>

            {/* Tooltip for the highlighted month */}
            {isHighlight && total > 0 && (
              <g transform={`translate(${x - 10}, ${topY - 60})`}>
                <rect x="0" y="0" width="160" height="60" rx="6" fill="#0f172a" opacity="0.95" />
                <g transform="translate(8,9)" fontSize="10" fill="#e2e8f0">
                  {series.map((s, idx) => {
                    const v = Number(s.data[i]) || 0;
                    const y = 11 + idx * 14;
                    return (
                      <g key={idx}>
                        <circle cx="4" cy={y - 3} r="3" fill={s.color} />
                        <text x="10" y={y}>{`• ${s.label}  ${formatCurrency(v)}`}</text>
                      </g>
                    );
                  })}
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function percent(n, d) { return d ? Math.round((n / d) * 100) : 0; }

function isRegularStaff(s) {
  const t = String(
    s?.employmentType ?? s?.type ?? s?.contractType ?? s?.category ?? s?.status ?? ''
  ).toLowerCase();
  return ['regular', 'full-time', 'permanent', 'employee', 'staff'].includes(t);
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
function isSameMonth(a, b) { return a && b && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); }

export default function Dashboard() {
  const { runs } = usePayroll();
  const { staff } = useStaff();
  const { notifications } = useNotifications();

  const latest = runs?.[0];

  // Dynamic footnote data
  const totalStaff = staff?.length ?? 0;
  const regularCount = (staff || []).filter(isRegularStaff).length;
  const regularPct = percent(regularCount, totalStaff);

  const now = new Date();
  const runsThisMonth = (runs || []).filter(r => {
    const d = guessRunDate(r);
    return d ? isSameMonth(d, now) : false;
  });
  const baseRuns = runsThisMonth.length ? runsThisMonth : (runs || []);
  const completedCount = baseRuns.filter(r => String(r?.status || '').toLowerCase() === 'completed').length;
  const pendingCount = baseRuns.filter(r => ['pending', 'processing', 'in-progress', 'in progress']
    .includes(String(r?.status || '').toLowerCase())).length;
  const completedPct = percent(completedCount, baseRuns.length);

  const gross = Number(latest?.totals?.gross ?? 0);
  const deductions = Number(latest?.totals?.deductions ?? 0);
  const deductionsPct = gross > 0 ? percent(deductions, gross) : null;

  const metrics = [
    {
      label: 'Total Staffs',
      value: totalStaff,
      footnote: totalStaff ? `${regularPct}% are regular staff` : '—',
      tone: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-500 text-emerald-700',
      Icon: Users,
      bg: 'bg-emerald-100 border-emerald-100',
    },
    {
      label: 'Payroll Processed',
      value: latest ? formatCurrency(latest?.totals?.gross) : '—',
      footnote: baseRuns.length ? `${completedPct}% completed ${runsThisMonth.length ? 'this month' : 'overall'}` : '—',
      tone: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-500 text-amber-700',
      Icon: WalletIcon,
      bg: 'bg-amber-100 border-amber-100',
    },
    {
      label: 'Pending payment',
      value: latest ? formatCurrency(latest?.totals?.net) : '—',
      footnote: baseRuns.length ? `${pendingCount} run${pendingCount === 1 ? '' : 's'} pending ${runsThisMonth.length ? 'this month' : 'overall'}` : '—',
      tone: 'bg-indigo-50 text-indigo-700',
      iconBg: 'bg-indigo-500 text-indigo-700',
      Icon: Wallet2,
      bg: 'bg-indigo-100 border-indigo-100',
    },
    {
      label: 'Loans and Tax Deduction',
      value: latest ? formatCurrency(deductions) : '—',
      footnote: deductionsPct != null ? `${deductionsPct}% of gross in latest run` : '—',
      tone: 'bg-rose-50 text-rose-700',
      iconBg: 'bg-rose-500 text-rose-700',
      Icon: PercentCircle,
      bg: 'bg-rose-100 border-rose-100',
    },
  ];

  // Dynamic monthly stacked breakdown from runs
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  const { baseSeries, allowSeries, arrearsSeries, hiIndex } = useMemo(() => {
    const count = months.length;
    const base = new Array(count).fill(0);
    const allow = new Array(count).fill(0);
    const arrears = new Array(count).fill(0);

    (runs || []).forEach(r => {
      const d = guessRunDate(r);
      if (!d) return;
      const idx = d.getMonth(); // 0-11
      if (idx < 0 || idx >= count) return;

      const gross = Number(r?.totals?.gross ?? 0);
      const allowances = Number(r?.totals?.allowances ?? r?.totals?.bonus ?? r?.totals?.bonuses ?? 0);
      const arr = Number(r?.totals?.arrears ?? 0);
      const baseVal = Math.max(0, gross - allowances - arr);

      base[idx] += baseVal;
      allow[idx] += allowances;
      arrears[idx] += arr;
    });

    const totals = months.map((_, i) => base[i] + allow[i] + arrears[i]);
    const maxVal = Math.max(...totals, 0);
    const hi = maxVal > 0 ? totals.indexOf(maxVal) : -1;

    return { baseSeries: base, allowSeries: allow, arrearsSeries: arrears, hiIndex: hi };
  }, [runs]);

  const recentNotifs = (notifications || []).slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Top metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, footnote, tone, iconBg, Icon, bg }) => (
          <div key={label} className={`rounded-lg ${bg} p-4`}>
            <div className="flex flex-col items-start">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center ${iconBg}`}>
                <Icon size={16} />
              </div>
              <div className="mt-2 text-xs text-gray-500">{label}</div>
            </div>
            <div className="mt-3 text-2xl font-semibold">{value}</div>
            <div className={`mt-2 inline-flex items-center rounded px-2 py-1 text-[11px] ${tone}`}>
              {footnote}
            </div>
          </div>
        ))}
      </div>

      {/* Middle: Expense breakdown + Chat updates */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Expense breakdown (spans 2 cols) */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Payroll Expense Breakdown</h3>
              <p className="text-xs text-gray-500">Here is a graph of payroll expenses breakdown</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border p-2 hover:bg-gray-50" title="Download">
                <Download size={16} />
              </button>
              <button className="rounded-md border p-2 hover:bg-gray-50" title="Options">
                <Settings2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <ExpenseBars
              labels={months}
              series={[
                { label: 'Base Salary', data: baseSeries, color: '#10b981' },
                { label: 'Allowances', data: allowSeries, color: '#f59e0b' },
                { label: 'Arrears', data: arrearsSeries, color: '#6366f1' },
              ]}
              highlightIndex={hiIndex}
            />
          </div>
        </div>

        {/* Chat updates */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Chat Updates</h3>
              <p className="text-xs text-gray-500">Here are all the updates of chat</p>
            </div>
            <Link to="/notifications" className="text-xs text-indigo-600 hover:underline">
              See All
            </Link>
          </div>

          <ul className="mt-3 space-y-3">
            {recentNotifs.length === 0 ? (
              <li className="text-sm text-gray-500">No recent messages</li>
            ) : (
              recentNotifs.map(n => (
                <li key={n.id} className="flex items-start gap-3">
                  {/* Avatar or initials */}
                  {n.avatarUrl ? (
                    <img src={n.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-xs font-semibold">
                      {initials(n.title)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-gray-800">{n.title}</p>
                      <span className="shrink-0 text-[11px] text-gray-400">{n.time || ''}</span>
                    </div>
                    <p className="truncate text-xs text-gray-500">{n.desc}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end">
        <button className="rounded-full border px-3 py-2 text-sm text-gray-700">Feedback</button>
      </div>
    </div>
  );
}
