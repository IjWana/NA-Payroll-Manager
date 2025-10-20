import { useEffect, useMemo, useState } from 'react';
import {
  FilePlus2,
  FileText,
  FolderOpen,
  Download,
  Trash2,
  Send,
  Edit,
  X,
  MoreVertical,
} from 'lucide-react';

const STORAGE_KEY = 'ps_docs';

function loadDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveDocs(docs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {}
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function fmtDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-gray-100 p-4 text-gray-500">
        <FolderOpen size={28} />
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-800">No Document found!</h3>
      <p className="mt-1 max-w-md text-xs text-gray-500">
        You do not have any reports and document available. Click now to create a report or document.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <FilePlus2 size={16} /> Create New
      </button>
    </div>
  );
}

function CreateModal({ open, onClose, onCreate, defaultStatus }) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('Report');
  useEffect(() => {
    if (!open) {
      setTitle('');
      setKind('Report');
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">Create New</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-50">
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., March 2025 Payroll Summary"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option>Report</option>
              <option>Document</option>
            </select>
          </div>
          <div className="text-xs text-gray-500">Destination: {defaultStatus[0].toUpperCase() + defaultStatus.slice(1)}</div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => {
                if (!title.trim()) return;
                onCreate({
                  id: uid(),
                  title: title.trim(),
                  type: kind,
                  status: defaultStatus, // inbox | draft | outbox
                  createdAt: new Date().toISOString(),
                  size: Math.floor(Math.random() * 900 + 100) + ' KB',
                });
                onClose();
              }}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit modal
function EditModal({ doc, onClose, onSave }) {
  const [title, setTitle] = useState(doc?.title || '');
  const [kind, setKind] = useState(doc?.type || 'Report');

  useEffect(() => {
    setTitle(doc?.title || '');
    setKind(doc?.type || 'Report');
  }, [doc]);

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">Edit Document</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-50" aria-label="Close edit dialog">
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Document title"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  onSave({ ...doc, title: title.trim(), type: kind, updatedAt: new Date().toISOString() });
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option>Report</option>
              <option>Document</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Cancel</button>
            <button
              disabled={!title.trim()}
              onClick={() => onSave({ ...doc, title: title.trim(), type: kind, updatedAt: new Date().toISOString() })}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsAndDocuments() {
  const [docs, setDocs] = useState(loadDocs());
  useEffect(() => saveDocs(docs), [docs]);

  const [tab, setTab] = useState('inbox'); // inbox | draft | outbox
  const [openModal, setOpenModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);

  const counts = useMemo(() => {
    const c = { inbox: 0, draft: 0, outbox: 0 };
    docs.forEach(d => (c[d.status] = (c[d.status] || 0) + 1));
    return c;
  }, [docs]);

  const items = useMemo(() => docs.filter(d => d.status === tab), [docs, tab]);

  function addDoc(d) {
    setDocs(prev => [d, ...prev]);
  }
  function removeDoc(id) {
    setDocs(prev => prev.filter(d => d.id !== id));
  }
  function moveDoc(id, status) {
    setDocs(prev => prev.map(d => (d.id === id ? { ...d, status } : d)));
  }
  function updateDoc(updated) {
    setDocs(prev => prev.map(d => (d.id === updated.id ? updated : d)));
    setEditDoc(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar (tabs + create) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {{
            inbox: 'Inbox',
            draft: 'Draft',
            outbox: 'Outbox',
          }[tab]}
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Create New
          <Send size={14} className="opacity-90" />
        </button>
      </div>

      {/* Body */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {items.length === 0 ? (
          <EmptyState onCreate={() => setOpenModal(true)} />
        ) : (
          <>
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-medium text-gray-800">{tab[0].toUpperCase() + tab.slice(1)}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr className="text-left">
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Created</th>
                    <th className="py-2 px-4">Size</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-indigo-50 text-indigo-700 grid place-items-center">
                            <FileText size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{doc.title}</div>
                            <div className="text-[11px] text-gray-500">{doc.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4">{doc.type}</td>
                      <td className="py-2 px-4">{fmtDate(doc.createdAt)}</td>
                      <td className="py-2 px-4">{doc.size || '—'}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          {doc.status !== 'outbox' && (
                            <button
                              title="Send"
                              onClick={() => moveDoc(doc.id, 'outbox')}
                              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Send
                            </button>
                          )}
                          {doc.status !== 'draft' && (
                            <button
                              title="Move to Draft"
                              onClick={() => moveDoc(doc.id, 'draft')}
                              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Draft
                            </button>
                          )}
                          {doc.status !== 'inbox' && (
                            <button
                              title="Move to Inbox"
                              onClick={() => moveDoc(doc.id, 'inbox')}
                              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              Inbox
                            </button>
                          )}
                          <button
                            title="Download"
                            onClick={() => window.alert('Pretend download: ' + doc.title)}
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                          >
                            <Download size={14} /> Download
                          </button>

                          {/* Edit moved beside Delete and colored blue */}
                          <button
                            title="Edit"
                            onClick={() => setEditDoc(doc)}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                          >
                            <Edit size={14} /> Edit
                          </button>

                          <button
                            title="Delete"
                            onClick={() => {
                              if (window.confirm('Delete this document?')) removeDoc(doc.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                          <button title="More" className="ml-1 rounded-md border p-1 hover:bg-gray-50">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <CreateModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        defaultStatus={tab}
        onCreate={(d) => addDoc(d)}
      />

      {/* Edit dialog */}
      <EditModal
        doc={editDoc}
        onClose={() => setEditDoc(null)}
        onSave={updateDoc}
      />
    </div>
  );
}