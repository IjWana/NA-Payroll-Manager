import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BadgeCheck,
} from 'lucide-react';

const STORAGE_KEY = 'ps_staff';

function loadStaff() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveStaff(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}
function numberOrZero(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}
function formatCurrency(n) {
  const v = numberOrZero(n);
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v);
  } catch {
    return '₦' + v.toLocaleString();
  }
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || 'NA';
}


/* Add/Edit Personnel Modal */
function PersonnelFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(() => ({
    id: initial?.id || '',
    employeeNo: initial?.employeeNo || '',
    fullName: initial?.fullName || '',
    rank: initial?.rank || '',
    corps: initial?.corps || '',
    fmnunit: initial?.fmnunit || '',
    basicSalary: initial?.basicSalary ?? '',
    allowance: initial?.allowance ?? '',
    bankName: initial?.bankName || '',
    accountNumber: initial?.accountNumber || '',
    status: initial?.status || 'Active',
  }));
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm({
        id: initial?.id || '',
        employeeNo: initial?.employeeNo || '',
        fullName: initial?.fullName || '',
        rank: initial?.rank || '',
        corps: initial?.corps || '',
        fmnunit: initial?.fmnunit || '',
        basicSalary: initial?.basicSalary ?? '',
        allowance: initial?.allowance ?? '',
        bankName: initial?.bankName || '',
        accountNumber: initial?.accountNumber || '',
        status: initial?.status || 'Active',
      });
      setErrors({});
      setTimeout(() => firstRef.current?.focus(), 30);
    }
  }, [open, initial]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.employeeNo.trim()) e.employeeNo = 'Army number is required';
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    const bs = Number(form.basicSalary);
    if (!Number.isFinite(bs) || bs < 0) e.basicSalary = 'Enter a valid salary';
    const al = Number(form.allowance || 0);
    if (!Number.isFinite(al) || al < 0) e.allowance = 'Enter a valid allowance';
    if (!form.bankName.trim()) e.bankName = 'Bank name is required';
    if (!/^\d{10,12}$/.test(String(form.accountNumber || ''))) e.accountNumber = 'Enter 10–12 digit account number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      basicSalary: Number(form.basicSalary),
      allowance: Number(form.allowance || 0),
      id: form.id || uid(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-medium text-gray-800">{form.id ? 'Edit Personnel' : 'Add Personnel'}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-50" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600">Army Number</label>
            <input
              ref={firstRef}
              value={form.employeeNo}
              onChange={(e) => setForm(f => ({ ...f, employeeNo: e.target.value }))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., NA/12345"
            />
            {errors.employeeNo && <p className="mt-1 text-xs text-rose-600">{errors.employeeNo}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">Full Name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Surname Firstname"
            />
            {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">Rank</label>
            <input
              value={form.rank}
              onChange={(e) => setForm(f => ({ ...f, rank: e.target.value }))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., Captain"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Corps</label>
            <input
              value={form.corps}
              onChange={(e) => setForm(f => ({ ...f, corps: e.target.value }))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., NAFC"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Fmn/Unit</label>
            <input
              value={form.fmnunit}
              onChange={(e) => setForm(f => ({ ...f, fmnunit: e.target.value }))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 7 Division/212 Bn"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Basic Salary (NGN)</label>
            <input
              value={form.basicSalary}
              onChange={(e) => setForm(f => ({ ...f, basicSalary: e.target.value }))}
              inputMode="numeric"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 250000"
            />
            {errors.basicSalary && <p className="mt-1 text-xs text-rose-600">{errors.basicSalary}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">Allowance (NGN)</label>
            <input
              value={form.allowance}
              onChange={(e) => setForm(f => ({ ...f, allowance: e.target.value }))}
              inputMode="numeric"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., 50000"
            />
            {errors.allowance && <p className="mt-1 text-xs text-rose-600">{errors.allowance}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">Bank Name</label>
            <input
              value={form.bankName}
              onChange={(e) => setForm(f => ({ ...f, bankName: e.target.value }))}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g., First Bank"
            />
            {errors.bankName && <p className="mt-1 text-xs text-rose-600">{errors.bankName}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">Account Number</label>
            <input
              value={form.accountNumber}
              onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }))}
              inputMode="numeric"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="10-12 digits"
              maxLength={12}
            />
            {errors.accountNumber && <p className="mt-1 text-xs text-rose-600">{errors.accountNumber}</p>}
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Save size={16} /> {form.id ? 'Save changes' : 'Add Personnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Profile Viewer */
function PersonnelProfile({ open, onClose, data }) {
  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">Personnel Profile</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-50" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-semibold">
            {initials(data.fullName)}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">{data.fullName}</p>
            <p className="text-xs text-gray-500">{data.employeeNo}</p>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-500">Rank</div><div className="text-gray-800">{data.rank || '—'}</div>
              <div className="text-gray-500">Corps</div><div className="text-gray-800">{data.corps || '—'}</div>
              <div className="text-gray-500">Fmn/Unit</div><div className="text-gray-800">{data.fmnunit || '—'}</div>
              <div className="text-gray-500">Basic Salary</div><div className="text-gray-800">{formatCurrency(data.basicSalary)}</div>
              <div className="text-gray-500">Allowance</div><div className="text-gray-800">{formatCurrency(data.allowance)}</div>
              <div className="text-gray-500">Bank</div><div className="text-gray-800">{data.bankName || '—'}</div>
              <div className="text-gray-500">Account No.</div><div className="text-gray-800">{data.accountNumber || '—'}</div>
              <div className="text-gray-500">Status</div>
              <div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                  (data.status || '').toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <BadgeCheck size={12} className="mr-1" /> {data.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          This profile is read-only. Use Edit to update salary, allowance, or bank details.
        </div>
      </div>
    </div>
  );
}

export default function PersonnelManagement() {
  const [rows, setRows] = useState(loadStaff());
  useEffect(() => saveStaff(rows), [rows]);

  // Search and sorting
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDir, setSortDir] = useState('asc');

  const setSort = (key) => {
    if (sortBy === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = rows;
    if (s) {
      list = rows.filter(r =>
        [r.fullName, r.employeeNo, r.rank, r.corps, r.fmnunit, r.bankName, r.accountNumber]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(s))
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    const val = (r) => {
      const v = r[sortBy];
      if (['basicSalary', 'allowance'].includes(sortBy)) return Number(v) || 0;
      return String(v || '').toLowerCase();
    };
    return [...list].sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0));
  }, [rows, q, sortBy, sortDir]);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showProfile, setShowProfile] = useState(null);

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (row) => { setEditing(row); setShowForm(true); };
  const saveRow = (data) => {
    setRows(prev => {
      const exists = prev.some(r => r.id === data.id);
      if (exists) return prev.map(r => (r.id === data.id ? data : r));
      // enforce unique Army number
      if (prev.some(r => r.employeeNo.trim().toLowerCase() === data.employeeNo.trim().toLowerCase())) {
        alert('Army number already exists');
        return prev;
      }
      return [data, ...prev];
    });
    setShowForm(false);
  };
  const delRow = (id) => {
    if (!window.confirm('Delete this personnel record?')) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header + actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black">Manage personnel payroll data. Add allowances, edit salaries, and update bank details.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50">Back to Dashboard</Link>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus size={16} /> Add Personnel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search personnel..."
            className="w-full rounded-md border pl-9 pr-3 py-2 text-sm"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-600 bg-gray-50">
            <tr className="text-left">
              {[
                { key: 'employeeNo', label: 'Army No' },
                { key: 'fullName', label: 'Full Name' },
                { key: 'rank', label: 'Rank' },
                { key: 'corps', label: 'Corps' },
                { key: 'fmnunit', label: 'Fmn/Unit' },
                { key: 'basicSalary', label: 'Basic Salary' },
                { key: 'allowance', label: 'Allowance' },
                { key: 'bankName', label: 'Bank' },
                { key: 'accountNumber', label: 'Account No.' },
              ].map(c => (
                <th key={c.key} className="py-2 px-4 cursor-pointer select-none" onClick={() => setSort(c.key)}>
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sortBy !== c.key ? <ArrowUpDown size={12} /> : sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  </span>
                </th>
              ))}
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">No personnel found</td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">{r.employeeNo}</td>
                  <td className="py-2 px-4">{r.fullName}</td>
                  <td className="py-2 px-4">{r.rank || '—'}</td>
                  <td className="py-2 px-4">{r.corps || '—'}</td>
                  <td className="py-2 px-4">{r.fmnunit || '—'}</td>
                  <td className="py-2 px-4">{formatCurrency(r.basicSalary)}</td>
                  <td className="py-2 px-4">{formatCurrency(r.allowance)}</td>
                  <td className="py-2 px-4">{r.bankName || '—'}</td>
                  <td className="py-2 px-4">{r.accountNumber || '—'}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowProfile(r)}
                        title="View profile"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        title="Edit"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => delRow(r.id)}
                        title="Delete"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <PersonnelFormModal open={showForm} onClose={() => setShowForm(false)} onSave={saveRow} initial={editing} />
      <PersonnelProfile open={!!showProfile} onClose={() => setShowProfile(null)} data={showProfile} />
    </div>
  );
}