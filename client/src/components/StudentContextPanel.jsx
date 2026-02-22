import { useEffect, useState } from 'react';
import { adminApi } from '../api/axios';

export default function StudentContextPanel({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    adminApi.get(`/students/${studentId}/context`)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Student details</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-full" />
            </div>
          ) : !data ? (
            <p className="text-slate-500">Could not load student.</p>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Profile</h3>
                <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                  <p><span className="text-slate-500 text-sm">Name</span> <span className="font-medium">{data.student?.name}</span></p>
                  <p><span className="text-slate-500 text-sm">Dept No</span> <span className="font-medium">{data.student?.deptNo}</span></p>
                  <p><span className="text-slate-500 text-sm">Department</span> <span className="font-medium">{data.student?.department}</span></p>
                  <p><span className="text-slate-500 text-sm">CGPA</span> <span className="font-medium">{data.student?.cgpa ?? '—'}</span></p>
                  <p><span className="text-slate-500 text-sm">Email</span> <span className="font-medium">{data.student?.email}</span></p>
                  {data.student?.phone && <p><span className="text-slate-500 text-sm">Phone</span> <span className="font-medium">{data.student.phone}</span></p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Applications</h3>
                {data.applications?.length ? (
                  <ul className="space-y-2">
                    {data.applications.map((a) => (
                      <li key={a.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                        <p className="font-medium text-slate-800">{a.companyName} – {a.role}</p>
                        <p className="text-slate-500">Status: <span className="font-medium">{a.status}</span></p>
                        <p className="text-slate-400 text-xs mt-1">Applied {new Date(a.appliedAt).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No applications</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Offers</h3>
                {data.offers?.length ? (
                  <ul className="space-y-2">
                    {data.offers.map((o) => (
                      <li key={o.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                        <p className="font-medium text-slate-800">{o.companyName} – {o.role}</p>
                        <p className="text-slate-500">Decision: {o.decision} · Deadline {new Date(o.offerDeadline).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No offers</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
