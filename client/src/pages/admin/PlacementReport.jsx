import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';

export default function AdminPlacementReport() {
  const [data, setData] = useState(null);
  const [expiringOffers, setExpiringOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get('/placement-report'),
      adminApi.get('/expiring-offers').then((r) => r.data.offers ?? []),
    ])
      .then(([report, offers]) => {
        setData(report.data);
        setExpiringOffers(offers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadExcel = async () => {
    try {
      const { data: blob } = await adminApi.get('/placement-report/export', { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'placement_report.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch (_) {
      toast.error('Export not available');
    }
  };

  if (loading) return <TableSkeleton rows={8} cols={5} />;
  if (!data) return <div className="p-8 text-slate-500">Failed to load report.</div>;

  const totals = data.totals || {};
  const byDept = data.byDepartment || [];
  const byCompany = data.byCompany || [];
  const placedStudents = data.placedStudents || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement report</h1>
          <p className="text-slate-500 mt-1">Overview by department and company</p>
        </div>
        <button onClick={downloadExcel} className="btn-secondary text-sm">Export Excel</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total students</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totals.totalStudents ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Placed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{totals.placed ?? 0}</p>
        </div>
      </div>

      {/* Expiring offers */}
      {expiringOffers.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
          <h2 className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">Offers expiring in 48h</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company / Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {expiringOffers.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4">{o.studentName} ({o.deptNo})</td>
                    <td className="py-3 px-4">{o.companyName} – {o.driveRole}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(o.offerDeadline).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By department */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">By department</h2>
        {byDept.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No department data.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Placed</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {byDept.map((row) => (
                  <tr key={row.department} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4 font-medium">{row.department}</td>
                    <td className="py-3 px-4">{row.placed}</td>
                    <td className="py-3 px-4">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* By company */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">By company / drive</h2>
        {byCompany.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No company data.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Selected</th>
                </tr>
              </thead>
              <tbody>
                {byCompany.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4 font-medium">{row.companyName}</td>
                    <td className="py-3 px-4">{row.role}</td>
                    <td className="py-3 px-4">{row.selectedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Placed students (detailed) */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Placed students</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Full details (also included in Excel export)
          </p>
        </div>
        {placedStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No placed students yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">CTC</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Salary package</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Rounds</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Offer</th>
                </tr>
              </thead>
              <tbody>
                {placedStudents.map((r) => (
                  <tr key={r.applicationId} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{r.studentName} ({r.deptNo})</div>
                      <div className="text-xs text-slate-500">{r.email}</div>
                    </td>
                    <td className="py-3 px-4">{r.department}</td>
                    <td className="py-3 px-4 font-medium">{r.companyName}</td>
                    <td className="py-3 px-4">{r.driveRole}</td>
                    <td className="py-3 px-4">{r.driveCtc ?? '-'}</td>
                    <td className="py-3 px-4">{r.companySalaryPackage ?? '-'}</td>
                    <td className="py-3 px-4">
                      <div>{r.roundsConducted ?? 0}</div>
                      {r.roundNames && <div className="text-xs text-slate-500 mt-1">{r.roundNames}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{r.offerDecision ?? '-'}</div>
                      {r.offerDeadline && <div className="text-xs text-slate-500 mt-1">{new Date(r.offerDeadline).toLocaleString()}</div>}
                    </td>
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
