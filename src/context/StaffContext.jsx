import React, { createContext, useContext, useState, useMemo } from 'react';

const StaffContext = createContext(null);

const initial = [
  { id: 'NA0001', name: 'John Musa', rank: 'Private', grade: 'E1', department: 'Infantry', baseSalary: 80000 },
  { id: 'NA0002', name: 'Grace Okoro', rank: 'Sergeant', grade: 'E5', department: 'Signals', baseSalary: 145000 },
  { id: 'NA0003', name: 'Bello Idris', rank: 'Captain', grade: 'O3', department: 'Logistics', baseSalary: 320000 },
];

export function StaffProvider({ children }) {
  const [staff, setStaff] = useState(initial);

  const addStaff = (record) => setStaff(p => [...p, record]);
  const updateStaff = (id, updates) => setStaff(p => p.map(r => r.id === id ? { ...r, ...updates } : r));
  const removeStaff = (id) => setStaff(p => p.filter(r => r.id !== id));

  const byId = useMemo(() => Object.fromEntries(staff.map(p => [p.id, p])), [staff]);

  return (
    <StaffContext.Provider value={{ staff, addStaff, updateStaff, removeStaff, byId }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() { return useContext(StaffContext); }
