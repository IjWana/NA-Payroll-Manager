import React, { createContext, useContext, useState } from 'react';
import { useStaff } from './StaffContext.jsx';
import { computePayrollForStaff, summarizePayroll } from '../lib/payroll.js';

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  const { staff } = useStaff();
  const [runs, setRuns] = useState([]); // each run: { id, period, records: [...], totals }

  const processPayroll = (period) => {
    const records = staff.map(p => computePayrollForStaff(p));
    const totals = summarizePayroll(records);
    const run = { id: Date.now().toString(), period, records, totals };
    setRuns(r => [run, ...r]);
    return run;
  };

  return (
    <PayrollContext.Provider value={{ runs, processPayroll }}>
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() { return useContext(PayrollContext); }
