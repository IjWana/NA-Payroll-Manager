import { describe, it, expect } from 'vitest';
import { calcAllowances, calcDeductions, computePayrollForPersonnel, summarizePayroll } from '../src/lib/payroll.js';

describe('payroll utils', () => {
  it('calculates allowances correctly', () => {
    const a = calcAllowances(1000);
    expect(a.housing).toBeCloseTo(250);
    expect(a.transport).toBeCloseTo(150);
    expect(a.uniform).toBeCloseTo(50);
    expect(a.total).toBeCloseTo(450);
  });

  it('calculates deductions correctly', () => {
    const d = calcDeductions(1000, 450);
    expect(d.pension).toBeCloseTo(75);
    expect(d.tax).toBeCloseTo(145); // 10% of 1450
    expect(d.nhf).toBeCloseTo(25);
    expect(d.total).toBeCloseTo(245);
  });

  it('computes payroll record', () => {
    const rec = computePayrollForPersonnel({ id:'X', name:'Test', rank:'Private', baseSalary: 1000 });
    expect(rec.gross).toBeCloseTo(1450);
    expect(rec.net).toBeCloseTo(1450 - 245);
  });

  it('summarizes payroll list', () => {
    const r1 = computePayrollForPersonnel({ id:'1', name:'A', rank:'R', baseSalary: 1000 });
    const r2 = computePayrollForPersonnel({ id:'2', name:'B', rank:'R', baseSalary: 2000 });
    const s = summarizePayroll([r1, r2]);
    expect(s.base).toBe(3000);
    expect(s.gross).toBeCloseTo(r1.gross + r2.gross);
  });
});
