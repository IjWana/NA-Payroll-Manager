import { useState } from 'react';
import { usePayroll } from '../context/PayrollContext.jsx';
import { useStaff } from '../context/StaffContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table.jsx';

export default function Payroll() {
  const { processPayroll, runs } = usePayroll();
  const { staff } = useStaff();
  const [period, setPeriod] = useState(new Date().toISOString().slice(0,7));
  const latest = runs[0];

  const handleRun = () => {
    processPayroll(period);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payroll Period</label>
          <input type="month" value={period} onChange={e=>setPeriod(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="text-sm text-gray-600">Staff in scope: <span className="font-medium">{staff.length}</span></div>
        <Button onClick={handleRun}>Process Payroll</Button>
      </div>

      {!latest && <p className="text-sm text-gray-600">No payroll processed yet for this session.</p>}

      {latest && (
        <div className="space-y-4">
          <h3 className="font-semibold">Latest Run: {latest.period}</h3>
          <div className="text-sm text-gray-700 flex flex-wrap gap-4">
            <span>Gross: ₦{latest.totals.gross.toLocaleString()}</span>
            <span>Deductions: ₦{latest.totals.deductions.toLocaleString()}</span>
            <span>Net: ₦{latest.totals.net.toLocaleString()}</span>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>ID</TH><TH>Name</TH><TH>Rank</TH><TH>Base</TH><TH>Allowances</TH><TH>Deductions</TH><TH>Gross</TH><TH>Net</TH>
              </TR>
            </THead>
            <TBody>
              {latest.records.map(r => (
                <TR key={r.id}>
                  <TD className="font-mono text-xs">{r.id}</TD>
                  <TD>{r.name}</TD>
                  <TD>{r.rank}</TD>
                  <TD>₦{r.base.toLocaleString()}</TD>
                  <TD>₦{r.allowances.total.toLocaleString()}</TD>
                  <TD>₦{r.deductions.total.toLocaleString()}</TD>
                  <TD>₦{r.gross.toLocaleString()}</TD>
                  <TD className="font-semibold">₦{r.net.toLocaleString()}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
