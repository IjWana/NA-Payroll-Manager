import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Pencil,
  CreditCard,
  ShieldCheck,
  UserCheck,
  MoreVertical,
} from 'lucide-react';
import { } from 'react';
import { } from 'react';
import { } from 'react';

// Optional contexts (app already uses these elsewhere)
import { useAuth } from '../context/AuthContext.jsx';
import { useStaff } from '../context/StaffContext.jsx';

const PROFILE_KEY = 'ps_profile';
const ACCOUNT_KEY = 'ps_payment_account';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveToStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const { user } = useAuth?.() || { user: null };
  const { staff = [], approveStaff } = useStaff?.() || { staff: [] };

  // Profile
  const defaultProfile = useMemo(
    () => ({
      fullName: user?.name || 'User',
      dob: user?.dob || '—',
      gender: user?.gender || '—',
      placeOfBirth: user?.placeOfBirth || '—',
      maritalStatus: user?.maritalStatus || 'Single',
      rank: user?.rank || '—',
      department: user?.department || '—',
      region: user?.region || '—',
      status: user?.active ? 'Active' : 'Inactive',
      tier: user?.tier || 'Tier 1',
      avatar: user?.avatar || '',
    }),
    [user]
  );

  const [profile, setProfile] = useState(() => loadFromStorage(PROFILE_KEY, defaultProfile));
  useEffect(() => {
    // If auth user changes, merge new fields once
    setProfile(prev => ({ ...defaultProfile, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    saveToStorage(PROFILE_KEY, profile);
  }, [profile]);

  // Avatar upload
  const fileRef = useRef(null);
  const onPick = () => fileRef.current?.click();
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await toDataUrl(f);
    setProfile(p => ({ ...p, avatar: dataUrl }));
  };

  // Payment account card (dynamic)
  const [account, setAccount] = useState(() =>
    loadFromStorage(ACCOUNT_KEY, { bankName: '', status: 'not connected' })
  );
  useEffect(() => saveToStorage(ACCOUNT_KEY, account), [account]);

  const connectAccount = () => {
    setAccount({ bankName: 'FIRST BANK', status: 'connected' });
  };
  const disconnectAccount = () => setAccount({ bankName: '', status: 'not connected' });

  // Tier generation
  const generateTier = () => {
    const levels = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
    const next = levels[(levels.indexOf(profile.tier) + 1) % levels.length];
    setProfile(p => ({ ...p, tier: next }));
  };

  // Approvals (dynamic via StaffContext when available)
  const pendingApprovals = useMemo(
    () => (Array.isArray(staff) ? staff.filter(s => !s?.approved).length : 0),
    [staff]
  );
  const approveAll = () => {
    if (typeof approveStaff === 'function') {
      staff.forEach(s => !s.approved && approveStaff(s.id, true));
    }
    // UI-only feedback
    alert('Approval initiated for pending staff.');
  };

  // Personal info list (aligns with screenshot)
  const fields = [
    { label: 'Full name', key: 'fullName' },
    { label: 'Date of Birth (DOB)', key: 'dob' },
    { label: 'Gender', key: 'gender' },
    { label: 'Place of Birth', key: 'placeOfBirth' },
    { label: 'Marital Status', key: 'maritalStatus' },
    { label: 'Rank', key: 'rank' },
    { label: 'Department', key: 'department' },
    { label: 'Region', key: 'region' },
  ];
  const [showMore, setShowMore] = useState(false);
  const visibleFields = showMore ? fields : fields.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100 ring-2 ring-emerald-600/10">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-gray-400">IMG</div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-medium text-white">
              {profile.tier}
            </span>
          </div>

          <div>
            <button
              onClick={onPick}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs hover:bg-gray-50"
            >
              <Camera size={14} /> Update profile Image
            </button>
            <input
              ref={fileRef}
              onChange={onFile}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-md border p-2 hover:bg-gray-50" title="More">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Main grid: Personal info + action cards */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Personal Information */}
        <section className="xl:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <div className="mt-1 text-xs text-gray-500">Biographical Data</div>

          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {visibleFields.map(({ label, key }) => (
              <div key={key} className="flex justify-between gap-4 border-b border-gray-100 py-2">
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="text-sm text-gray-800">{profile[key] || '—'}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-xs text-gray-400">Status</dt>
              <dd>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                  profile.status?.toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {profile.status || '—'}
                </span>
              </dd>
            </div>
          </dl>

          <button
            onClick={() => setShowMore(s => !s)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            {showMore ? 'See less' : 'See more'}
          </button>
        </section>

        {/* Right column quick actions */}
        <aside className="space-y-4">
          {/* Payment Accounts */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
                <CreditCard size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Payment Accounts</div>
                <p className="mt-1 text-xs text-gray-500">Update or Add an account for payroll payment.</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">{account.bankName || '—'}</div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                    account.status === 'connected'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {account.status === 'connected' ? 'Connected' : 'Not connected'}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  {account.status === 'connected' ? (
                    <button
                      onClick={disconnectAccount}
                      className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectAccount}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Tier ID number */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Generate Tier ID number</div>
                <p className="mt-1 text-xs text-gray-500">Generate and assign level of access to the staff</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    Current level: <span className="font-semibold">{profile.tier}</span>
                  </div>
                  <button
                    onClick={generateTier}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Approve Staff */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
                <UserCheck size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Approve Staff</div>
                <p className="mt-1 text-xs text-gray-500">Approve added staff and generate their tier ID</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    Pending: <span className="font-semibold">{pendingApprovals}</span>
                  </div>
                  <button
                    onClick={approveAll}
                    disabled={!pendingApprovals}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      pendingApprovals
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
