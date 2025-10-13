import { usePayroll } from '../context/PayrollContext.jsx';
import { useStaff } from '../context/StaffContext.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';

export default function Dashboard() {
  const { runs } = usePayroll();
  const { staff } = useStaff();
  const latest = runs[0];

  const metrics = [
    { label: 'Staff', value: staff.length },
    { label: 'Total Gross', value: latest ? '₦'+latest.totals.gross.toLocaleString() : '—' },
    { label: 'Total Deductions', value: latest ? '₦'+latest.totals.deductions.toLocaleString() : '—' },
    { label: 'Total Net', value: latest ? '₦'+latest.totals.net.toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Operational Overview</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!latest && <p className="text-sm text-gray-600">Process a payroll run to populate financial metrics.</p>}
    </div>
  );
}
