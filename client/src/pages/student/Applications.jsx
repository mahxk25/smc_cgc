import { useEffect, useState } from 'react';
import { studentApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';

export default function StudentApplications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.get('/applications').then(({ data }) => setList(data.applications || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <TableSkeleton rows={6} cols={5} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
        <p className="text-slate-500 mt-1">Status timeline for each drive</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        {list.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Applied</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} className="table-row-hover border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4">{a.companyName}</td>
                    <td className="py-3 px-4">{a.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        a.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                        a.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                        a.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">{new Date(a.appliedAt).toLocaleDateString()}</td>
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
