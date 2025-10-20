import { useMemo } from 'react';
import {
  CalendarDays,
  BadgeCheck,
  Send,
  AlertOctagon,
  Filter,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { usePayroll } from '../context/PayrollContext.jsx';

function percent(n, d) {
  if (!d) return 0;
  const p = Math.round((Number(n) / Number(d)) * 100);
  return Number.isFinite(p) ? p : 0;
}

function fmtDateISO(d) {
  try {
    const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (!dt || Number.isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); // Feb 1, 2025
  } catch {
    return '—';
  }
}

function monthYear(d) {
  try {
    const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (!dt || Number.isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); // March 2025
  } catch {
    return '—';
  }
}

function guessRunDate(r) {
  let v = r?.periodDate ?? r?.date ?? r?.createdAt ?? r?.paymentDate ?? r?.approvalDate ?? r?.processingDate ?? r?.periodLabel ?? r?.period ?? r?.name;
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

function labelForRun(r) {
  const lbl = r?.periodLabel || r?.period;
  if (lbl) return lbl;
  const d = guessRunDate(r);
  return d ? monthYear(d) : (r?.name || 'Run');
}

function normalizeSchedule(r, idx) {
  const statusRaw = String(r?.status || '').toLowerCase();
  let status = 'completed';
  if (statusRaw.includes('pend')) status = 'pending';
  else if (statusRaw.includes('progress')) status = 'in-progress';
  else if (statusRaw.includes('process')) status = 'in-progress';
  else if (statusRaw.includes('fail')) status = 'failed';
  else if (statusRaw) status = statusRaw;

  // Accept many shapes
  const processing = r?.processingDate ?? r?.dates?.processing ?? r?.startedAt ?? r?.createdAt;
  const approval = r?.approvalDate ?? r?.dates?.approval ?? r?.approvedAt;
  const payment = r?.paymentDate ?? r?.dates?.payment ?? r?.paidAt ?? r?.completedAt;

  return {
    id: r?.id ?? idx,
    period: labelForRun(r),
    processing: processing ? fmtDateISO(processing) : '—',
    approval: approval ? fmtDateISO(approval) : '—',
    payment: payment ? fmtDateISO(payment) : '—',
    status,
    paymentRaw: payment || guessRunDate(r),
  };
}

function StatusPill({ value }) {
  const v = String(value || '').toLowerCase();
  const map = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'in-progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const label =
    v === 'in-progress' ? 'In-progress' :
    v === 'pending' ? 'Pending' :
    v === 'failed' ? 'Failed' : 'Completed';
  const cls = map[v] || map.completed;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>;
}

// Helpers to normalize per-staff entries for sidebar metrics
function pick(val, ...keys) {
  for (const k of keys) {
    const v = val?.[k];
    if (v != null) return v;
  }
  return undefined;
}
function getEntries(run) {
  const list =
    run?.entries ||
    run?.items ||
    run?.payslips ||
    run?.rows ||
    run?.staffEntries ||
    [];
  return list.map((row, idx) => ({
    id: row.id ?? row.employeeId ?? idx,
    deductions: Number(pick(row, 'deductions', 'totalDeductions', 'loanRepayment', 'loans', 'tax') ?? 0),
  }));
}

export default function PayrollCalendar() {
  const { runs = [] } = usePayroll();

  // Build rows with a reference to the underlying run
  const rows = useMemo(() => {
    const base = (runs.length ? runs : []).map((r, i) => {
      const s = normalizeSchedule(r, i);
      return { ...s, runRef: r };
    });
    base.sort((a, b) => {
      const A = new Date(a.paymentRaw || 0).getTime();
      const B = new Date(b.paymentRaw || 0).getTime();
      return B - A;
    });
    return base;
  }, [runs]);

  // Pick the next (or most recent) run for sidebar cards
  const selected = useMemo(() => {
    if (!rows.length) return null;
    const withDate = rows
      .map(r => ({ ...r, t: new Date(r.paymentRaw || 0).getTime() }))
      .filter(r => Number.isFinite(r.t));
    const now = Date.now();
    const future = withDate.filter(r => r.t >= now).sort((a, b) => a.t - b.t)[0];
    return future || withDate.sort((a, b) => b.t - a.t)[0] || rows[0];
  }, [rows]);

  const selectedRun = selected?.runRef || null;

  // Next payment badge (dynamic/empty)
  const next = useMemo(() => {
    if (!selected) return { label: '—', day: '—' };
    const d = new Date(selected.t || 0);
    if (!Number.isFinite(d.getTime())) return { label: '—', day: '—' };
    return { label: monthYear(d), day: d.toLocaleDateString(undefined, { weekday: 'short' }) };
  }, [selected]);

  // Dynamic Payment Account
  const account = selectedRun?.account || selectedRun?.paymentAccount || selectedRun?.bank || null;
  const bankName =
    account?.name ||
    account?.bankName ||
    selectedRun?.accountName ||
    selectedRun?.bankName ||
    '';
  const rawStatus = String(account?.status || selectedRun?.accountStatus || '').toLowerCase();
  const isConnected = rawStatus ? /connect|active|ok|linked/.test(rawStatus) : !!bankName;
  const statusText = isConnected ? 'Connected' : 'Not connected';
  const statusCls = isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600';

  // Dynamic Payslip metrics from selected run (empty if none)
  const entries = useMemo(() => (selectedRun ? getEntries(selectedRun) : []), [selectedRun]);
  const staffCount = entries.length;
  const loanCount = entries.filter(e => e.deductions > 0).length;

  // KPIs
  const latestRows = rows.slice(0, 6); // recent slice for KPIs
  const onTimeCount = latestRows.filter(r => r.status === 'completed').length;
  const onTimeRate = percent(onTimeCount, latestRows.length);

  // Payslip distribution accuracy: assume "completed" imply slips issued (or use entries in context if present)
  const distributionAccuracy = percent(
    latestRows.filter(r => r.status === 'completed' || r.status === 'in-progress').length,
    latestRows.length
  );

  // Error rate: treat failed rows as errors
  const errorRate = percent(latestRows.filter(r => r.status === 'failed').length, latestRows.length);

  const cards = [
    {
      label: 'On-time payroll processing',
      value: `${onTimeRate}%`,
      desc: 'Payroll prepared on schedule without delay',
      bg: 'bg-indigo-100 border-indigo-200',
      iconBg: 'bg-indigo-600',
      Icon: BadgeCheck,
    },
    {
      label: 'Payslip distribution accuracy',
      value: `${distributionAccuracy}%`,
      desc: 'Payslips generated and sent correctly',
      bg: 'bg-emerald-100 border-emerald-200',
      iconBg: 'bg-emerald-600',
      Icon: Send,
    },
    {
      label: 'Payroll error Rate',
      value: `${errorRate}%`,
      desc: 'Percentage of payroll transactions with Error',
      bg: 'bg-rose-100 border-rose-200',
      iconBg: 'bg-rose-600',
      Icon: AlertOctagon,
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI cards (icon above label) */}
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

      {/* Main content: table + right sidebar */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Left: Payroll date list */}
        <div className="xl:col-span-2 rounded-lg border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-medium text-gray-800">Payroll date list</h3>
            <p className="text-xs text-gray-500">Here are all Staff payroll details</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50">
              <CalendarDays size={16} /> {monthYear(new Date())}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50">
                <Filter size={16} /> Filter
              </button>
              <button type="button" className="inline-flex items-center justify-center rounded-md border p-1.5 hover:bg-gray-50">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr className="text-left">
                  <th className="py-2 px-4">Period</th>
                  <th className="py-2 px-4">Processing</th>
                  <th className="py-2 px-4">Approval</th>
                  <th className="py-2 px-4">Payment on</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4">{r.period}</td>
                    <td className="py-2 px-4">{r.processing}</td>
                    <td className="py-2 px-4">{r.approval}</td>
                    <td className="py-2 px-4">{r.payment}</td>
                    <td className="py-2 px-4"><StatusPill value={r.status} /></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-gray-500">No payroll schedule found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className={`h-8 w-8 rounded-md border ${n === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-gray-50'}`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Results per page</span>
              <div className="relative">
                <select className="rounded-md border px-2 py-1 pr-7">
                  {[10, 20, 30].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: side summary */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Next Payment</div>
                <div className="text-sm font-medium text-gray-800">Next payroll date</div>
              </div>
              <button className="inline-flex items-center justify-center rounded-md border p-1.5 hover:bg-gray-50">
                <MoreVertical size={16} />
              </button>
            </div>
            <div className="mt-3 text-lg font-semibold">{next.label}</div>
            <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs ${next.day !== '—' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {next.day}
            </div>
          </div>

          {/* Payment Account (empty and dynamic) */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Payment Account</div>
            <div className="mt-1 text-sm font-medium text-gray-800">Money Transfer through</div>
            <div className="mt-3 text-sm font-semibold">{bankName || '—'}</div>
            <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs ${statusCls}`}>
              {statusText}
            </div>
          </div>

          {/* Payslip (empty and dynamic) */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-800">Payslip</div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
              <span>Staffs</span>
              <span>{staffCount ? `${staffCount.toLocaleString()} Staffs` : '—'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
              <span>Loan and Deduction</span>
              <span>{loanCount ? `${loanCount.toLocaleString()} Staffs` : '—'}</span>
            </div>
            <button
              disabled={!staffCount}
              className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-medium ${staffCount ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              View and generate payslip
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}