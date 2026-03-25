import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/axios';
import { TableSkeleton, CardSkeleton } from '../../components/Skeleton';

export default function StudentDrives() {
  const navigate = useNavigate();
  const [data, setData] = useState({ drives: [], canApply: true, canApplyReason: null });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    studentApi.get('/drives').then(({ data: d }) => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const apply = async (driveId) => {
    if (applying) return;
    setApplying(true);
    try {
      const { data: res } = await studentApi.post(`/drives/${driveId}/apply`);
      toast.success('Application submitted! You can now chat with applicants and placement team.');
      const { data: d } = await studentApi.get('/drives');
      setData(d);
      if (res.chatRoomId) {
        navigate(`/student/chat?room=${res.chatRoomId}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const openConfirm = (drive) => {
    setSelectedDrive(drive);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (applying) return;
    setConfirmOpen(false);
    setSelectedDrive(null);
  };

  const confirmApply = async () => {
    if (!selectedDrive?.id) return;
    await apply(selectedDrive.id);
    setConfirmOpen(false);
    setSelectedDrive(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton w-48 rounded" />
        <div className="grid gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  const filteredDrives = data.drives.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const text = `${d.companyName || ''} ${d.role || ''}`.toLowerCase();
      if (!text.includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Placement Drives</h1>
        <p className="text-slate-500 mt-1">Apply to drives (max 3 applications; constraints apply)</p>
      </div>
      {!data.canApply && data.canApplyReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          {data.canApplyReason}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by company or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 w-full sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 w-full sm:w-48"
        >
          <option value="">All statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredDrives.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">No drives available.</div>
        ) : (
          filteredDrives.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-800">{d.companyName} – {d.role}</h3>
                <p className="text-sm text-slate-500 mt-1">CTC: {d.ctc || '—'} · Status: {d.status}</p>
                <p className="text-sm text-slate-600 mt-1">{d.eligibility || '—'}</p>
                <p className="text-xs text-slate-400 mt-1">Deadline: {d.deadline ? new Date(d.deadline).toLocaleString() : '—'}</p>
                {!data.canApply && data.canApplyReason && !d.applicationStatus && (
                  <p className="text-xs text-amber-600 mt-1">You cannot apply: {data.canApplyReason}</p>
                )}
              </div>
              <div>
                {d.applicationStatus ? (
                  <span className="inline-block px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-medium">{d.applicationStatus}</span>
                ) : data.canApply ? (
                  <button onClick={() => openConfirm(d)} className="btn-primary">Apply</button>
                ) : (
                  <span className="text-slate-400 text-sm">Applications closed</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer / confirmation modal */}
      {confirmOpen && selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeConfirm}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Before you apply</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedDrive.companyName} – {selectedDrive.role}
                </p>
              </div>
              <button
                type="button"
                onClick={closeConfirm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
                disabled={applying}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900 font-semibold">Disclaimer</p>
                <ul className="mt-2 text-sm text-amber-800 space-y-1 list-disc pl-5">
                  <li>By applying, your application will be submitted to the placement team.</li>
                  <li>
                    You’ll be added to the <span className="font-semibold">company chat group</span> so you can receive updates and communicate.
                  </li>
                  <li>After applying, you can track status under Applications.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-700">
                  <div className="font-semibold text-slate-800">Drive details</div>
                  <div className="mt-1">CTC: {selectedDrive.ctc || '—'} · Status: {selectedDrive.status}</div>
                  <div className="mt-1 text-slate-600">Deadline: {selectedDrive.deadline ? new Date(selectedDrive.deadline).toLocaleString() : '—'}</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button type="button" onClick={closeConfirm} className="btn-secondary" disabled={applying}>
                Cancel
              </button>
              <button type="button" onClick={confirmApply} className="btn-primary" disabled={applying}>
                {applying ? 'Applying…' : 'Confirm apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
