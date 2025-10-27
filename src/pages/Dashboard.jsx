import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet2,
  Download,
  Settings2,
  WalletIcon,
  UserPlus,
  PlayCircle,
  FileText,
} from 'lucide-react';
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
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || 'NA';
}

// Utility: load Reports count from storage
function loadReportsCount() {
  try {
    const raw = localStorage.getItem('ps_docs');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

// Simple SVG bar chart with gradient + hatch pattern (dynamic stacked)
function ExpenseBars({ labels, series, highlightIndex = -1 }) {
  // series: [{ label, data: number[], color }]
  const totalsByMonth = labels.map((_, i) => series.reduce((sum, s) => sum + (Number(s.data[i]) || 0), 0));
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

        // stacked segments bottom-up
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
  const t = String(s?.employmentType ?? s?.type ?? s?.contractType ?? s?.category ?? s?.status ?? '').toLowerCase();
  return ['regular', 'full-time', 'permanent', 'employee', 'staff'].includes(t);
}
function guessRunDate(r) {
  let v = r?.periodDate ?? r?.date ?? r?.createdAt ?? r?.periodLabel ?? r?.period ?? r?.name;
  if (!v) return null;
  try {
    if (typeof v === 'string') { if (/^\d{4}-\d{2}$/.test(v)) v = `${v}-01`; const d = new Date(v); return isNaN(d) ? null : d; }
    if (typeof v === 'number') return new Date(v);
  } catch {}
  return null;
}
function isSameMonth(a, b) { return a && b && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); }

export default function Dashboard() {
  const navigate = useNavigate();

  // Guard: allow only authenticated users
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('ps_auth') || '{}');
      if (!auth?.token) navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const { runs } = usePayroll();
  const { staff } = useStaff();
  const { notifications } = useNotifications();

  // Overview metrics
  const totalStaff = staff?.length ?? 0; // Total Soldiers
  const pendingAll = (runs || []).filter(r =>
    ['pending', 'processing', 'in-progress', 'in progress'].includes(String(r?.status || '').toLowerCase())
  ).length;

  // Total Processed Allowance (from completed runs)
  const processedAllowances = (runs || []).reduce((sum, r) => {
    const completed = String(r?.status || '').toLowerCase() === 'completed';
    if (!completed) return sum;
    const allowances = Number(r?.totals?.allowances ?? r?.totals?.bonus ?? r?.totals?.bonuses ?? 0);
    return sum + (Number.isFinite(allowances) ? allowances : 0);
  }, 0);

  // Reports count (from local storage)
  const reportsCount = loadReportsCount();

  const regularCount = (staff || []).filter(isRegularStaff).length;
  const regularPct = percent(regularCount, totalStaff);

  // Breakdown series (unchanged)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  const { baseSeries, allowSeries, arrearsSeries, hiIndex } = useMemo(() => {
    const count = months.length;
    const base = new Array(count).fill(0);
    const allow = new Array(count).fill(0);
    const arrears = new Array(count).fill(0);

    (runs || []).forEach(r => {
      const d = guessRunDate(r);
      if (!d) return;
      const idx = d.getMonth();
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

  // Recent activities from notifications
  const recent = (notifications || []).slice(0, 6);

  // Overview cards
  const metrics = [
    {
      label: 'Total Soldiers',
      value: totalStaff,
      footnote: totalStaff ? `${regularPct}% regular` : '—',
      tone: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-600 text-white',
      Icon: Users,
      bg: 'bg-emerald-100 border-emerald-100',
    },
    {
      label: 'Pending Payrolls',
      value: pendingAll,
      footnote: pendingAll ? 'awaiting processing' : 'none pending',
      tone: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-600 text-white',
      Icon: Wallet2,
      bg: 'bg-amber-100 border-amber-100',
    },
    {
      label: 'Total Processed Allowance',
      value: formatCurrency(processedAllowances),
      footnote: 'completed runs',
      tone: 'bg-indigo-50 text-indigo-700',
      iconBg: 'bg-indigo-600 text-white',
      Icon: WalletIcon,
      bg: 'bg-indigo-100 border-indigo-100',
    },
    {
      label: 'Reports',
      value: reportsCount,
      footnote: 'reports & documents',
      tone: 'bg-violet-50 text-violet-700',
      iconBg: 'bg-violet-600 text-white',
      Icon: FileText,
      bg: 'bg-violet-100 border-violet-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, footnote, tone, iconBg, Icon, bg }) => (
          <div key={label} className={`rounded-lg ${bg} p-4`}>
            <div className="flex flex-col items-start">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center ${iconBg}`}>
                <Icon size={16} />
              </div>
              <div className="mt-2 text-sm text-black">{label}</div>
            </div>
            <div className="mt-3 text-2xl font-semibold">{value}</div>
            <div className={`mt-2 inline-flex items-center rounded px-2 py-1 text-[11px] ${tone}`}>{footnote}</div>
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/soldier"
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
          title="Add Soldier"
        >
          <UserPlus size={16} /> Add Personnel
        </Link>
        <Link
          to="/payroll"
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
          title="Generate Payroll"
        >
          <PlayCircle size={16} /> Generate Payroll
        </Link>
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
          title="View Reports"
        >
          <FileText size={16} /> View Reports
        </Link>
      </div>

      {/* Middle: Expense breakdown + Recent activities */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Expense breakdown (spans 2 cols) */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-black">Payroll Expense Breakdown</h3>
              <p className="text-xs textblack">Real‑time monthly breakdown</p>
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

        {/* Recent activities */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-black">Recent Activities</h3>
              <p className="text-xs text-black">Latest updates and actions</p>
            </div>
            <Link to="/notifications" className="text-xs text-indigo-600 hover:underline">
              See All
            </Link>
          </div>

          <ul className="mt-3 space-y-3">
            {recent.length === 0 ? (
              <li className="text-sm text-black">No recent activity</li>
            ) : (
              recent.map(n => (
                <li key={n.id} className="flex items-start gap-3">
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
