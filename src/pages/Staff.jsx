import { useMemo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { useFilteredStaff } from '../components/FilterStaff.jsx';

function getVal(obj, key) {
  const v = obj?.[key];
  if (v == null) return '';
  return String(v).toLowerCase();
}

function formatNumber(n) {
  const v = Number(n ?? 0);
  return Number.isNaN(v) ? '0' : v.toLocaleString();
}

function isActiveStaff(s) {
  const flags = [
    s?.active,
    s?.isActive,
    s?.enabled,
    s?.onDuty,
    String(s?.status ?? '').toLowerCase() === 'active',
    String(s?.employmentStatus ?? '').toLowerCase() === 'active',
    String(s?.state ?? '').toLowerCase() === 'active',
  ];
  return flags.some(Boolean);
}

export default function Staff() {
  // use filtered list from global SearchContext
  const staff = useFilteredStaff();

  const { total, active, inactive } = useMemo(() => {
    const total = staff.length;
    const active = staff.reduce((acc, s) => acc + (isActiveStaff(s) ? 1 : 0), 0);
    const inactive = Math.max(0, total - active);
    return { total, active, inactive };
  }, [staff]);

  const cards = [
    {
      label: 'Total Staffs',
      value: formatNumber(total),
      desc: 'Counts reflect current search.',
      bg: 'bg-indigo-100 border-indigo-100',
      iconBg: 'bg-indigo-600',
      Icon: Users,
    },
    {
      label: 'Active Staffs',
      value: formatNumber(active),
      desc: 'Currently active and receiving payroll/benefits.',
      bg: 'bg-emerald-100 border-emerald-100',
      iconBg: 'bg-emerald-600',
      Icon: UserCheck,
    },
    {
      label: 'In-active Staffs',
      value: formatNumber(inactive),
      desc: 'On leave or inactive with adjustments.',
      bg: 'bg-rose-100 border-rose-100',
      iconBg: 'bg-rose-600',
      Icon: UserX,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Heading moved to Topbar */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, desc, bg, iconBg, Icon }) => (
          <div key={label} className={`rounded-lg border ${bg} p-4`}>
            <div className="flex flex-col items-start">
              <div className={`h-7 w-7 rounded-md ${iconBg} text-white grid place-items-center`}>
                <Icon size={14} />
              </div>
              <div className="mt-2 text-xs text-gray-500">{label}</div>
              <div className="mt-3 text-2xl font-semibold">{value}</div>
              <p className="mt-2 text-xs text-gray-600">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
