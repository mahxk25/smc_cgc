import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';
import Breadcrumbs from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

export default function AdminEventRegistrations() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get(`/events/${eventId}`).then(({ data }) => setEvent(data)).catch(() => navigate('/admin/events'));
    adminApi.get(`/events/${eventId}/registrations`).then(({ data }) => setList(data.registrations || [])).catch(() => {}).finally(() => setLoading(false));
  }, [eventId, navigate]);

  const downloadExport = async () => {
    try {
      const { data } = await adminApi.get(`/events/${eventId}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${eventId}_registrations.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch (_) {
      toast.error('Export failed');
    }
  };

  if (!event && !loading) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[
        { label: 'Events', to: '/admin/events' },
        { label: event?.title ?? 'Event', to: '/admin/events' },
        { label: 'Registrations' },
      ]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{event?.title}</h1>
        <p className="text-slate-500 text-sm">Registrations</p>
      </div>
      <button onClick={downloadExport} className="btn-secondary">Export Excel</button>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No registrations yet</p>
            <p className="text-slate-400 text-sm mt-1">Registrations will appear here when students sign up</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Dept No</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Registered at</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="table-row-hover border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4">{r.deptNo}</td>
                    <td className="py-3 px-4">{r.name}</td>
                    <td className="py-3 px-4">{r.department}</td>
                    <td className="py-3 px-4">{r.email}</td>
                    <td className="py-3 px-4 text-slate-500 text-sm">{new Date(r.registeredAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
