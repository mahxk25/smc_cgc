import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';

export default function StudentNotifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.get('/notifications').then(({ data }) => setList(data.notifications || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await studentApi.post(`/notifications/${id}/read`);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n)));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (_) {}
  };

  if (loading) return <TableSkeleton rows={8} cols={3} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        <p className="text-slate-500 mt-1">Alerts and reminders</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        {list.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No notifications.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((n) => (
              <li
                key={n.id}
                className={`p-4 transition ${n.isRead ? 'bg-white' : 'bg-primary-50/30'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{n.title}</p>
                    {n.message && <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    {n.link && (
                      <Link to={n.link} className="inline-block mt-2 text-sm text-primary-600 font-medium hover:underline">
                        View →
                      </Link>
                    )}
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="text-sm text-primary-600 font-medium hover:underline shrink-0">
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
