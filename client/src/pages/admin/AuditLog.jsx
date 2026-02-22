import { useEffect, useState } from 'react';
import { adminApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';

const LIMIT = 20;

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [fromDate, setFromDate] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    const params = { limit: LIMIT, offset };
    if (actionFilter) params.action = actionFilter;
    if (fromDate) params.fromDate = fromDate;
    adminApi.get('/audit-log', { params })
      .then(({ data }) => {
        setLogs(data.logs || []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [offset, actionFilter, fromDate]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit log</h1>
        <p className="text-slate-500 mt-1">Admin and system actions</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by action"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setOffset(0); }}
          className="px-4 py-2 rounded-lg border border-slate-200 w-48"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setOffset(0); }}
          className="px-4 py-2 rounded-lg border border-slate-200"
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={LIMIT} cols={4} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No audit entries</p>
            <p className="text-slate-400 text-sm mt-1">Actions will appear here as you use the admin panel</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Actor</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4 text-slate-500 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">{log.actorType} #{log.actorId}</td>
                    <td className="py-3 px-4 font-medium">{log.action}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{log.metaJson ? JSON.stringify(log.metaJson) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Showing {logs.length ? offset + 1 : 0}–{offset + logs.length} of {total}</p>
        <div className="flex gap-2">
          <button onClick={() => setOffset((o) => Math.max(0, o - LIMIT))} disabled={offset === 0} className="btn-secondary disabled:opacity-50">Previous</button>
          <button onClick={() => setOffset((o) => o + LIMIT)} disabled={offset + logs.length >= total} className="btn-secondary disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
