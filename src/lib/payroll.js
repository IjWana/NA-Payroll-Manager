// Basic payroll calculation utilities (simplified for demo)
// Real logic would incorporate complex Nigerian tax laws, allowances, service years, hazard pay, etc.

export function calcAllowances(baseSalary) {
  // simple percentages for demo purposes
  const housing = baseSalary * 0.25; // 25%
  const transport = baseSalary * 0.15; // 15%
  const uniform = baseSalary * 0.05; // 5%
  return { housing, transport, uniform, total: housing + transport + uniform };
}

export function calcDeductions(baseSalary, allowanceTotal) {
  const pension = baseSalary * 0.075; // 7.5%
  const tax = (baseSalary + allowanceTotal) * 0.10; // flat 10% demo
  const nhf = baseSalary * 0.025; // housing fund 2.5% demo
  return { pension, tax, nhf, total: pension + tax + nhf };
}

export function computePayrollForStaff(person) {
  const allowances = calcAllowances(person.baseSalary);
  const deductions = calcDeductions(person.baseSalary, allowances.total);
  const gross = person.baseSalary + allowances.total;
  const net = gross - deductions.total;
  return {
    id: person.id,
    name: person.name,
    rank: person.rank,
    base: person.baseSalary,
    allowances,
    deductions,
    gross,
    net,
  };
}

export function summarizePayroll(records) {
  return records.reduce((acc, r) => {
    acc.base += r.base;
    acc.allowances += r.allowances.total;
    acc.deductions += r.deductions.total;
    acc.gross += r.gross;
    acc.net += r.net;
    return acc;
  }, { base:0, allowances:0, deductions:0, gross:0, net:0 });
}
