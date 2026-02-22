import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';
import StudentContextPanel from '../../components/StudentContextPanel';

const LIMIT = 10;

export default function AdminStudents() {
  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [offset, setOffset] = useState(0);
  const [modal, setModal] = useState(null);
  const [contextStudentId, setContextStudentId] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState({ deptNo: '', name: '', password: '', department: '', cgpa: '', email: '', phone: '' });

  const fetch = () => {
    setLoading(true);
    const params = { limit: LIMIT, offset };
    if (search) params.search = search;
    if (department) params.department = department;
    adminApi.get('/students', { params }).then(({ data }) => {
      setList(data.students || []);
      setTotalCount(data.totalCount ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, [offset, search, department]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.deptNo || !form.name || !form.password || !form.department || !form.email) {
      toast.error('Fill required fields');
      return;
    }
    try {
      await adminApi.post('/students', form);
      toast.success('Student created');
      setModal(null);
      setForm({ deptNo: '', name: '', password: '', department: '', cgpa: '', email: '', phone: '' });
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  const update = async (e) => {
    e.preventDefault();
    try {
      await adminApi.patch(`/students/${modal.id}`, { name: form.name, department: form.department, cgpa: form.cgpa, email: form.email, phone: form.phone });
      toast.success('Updated');
      setModal(null);
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await adminApi.delete(`/students/${id}`);
      toast.success('Deleted');
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  const openEdit = (s) => {
    setModal({ id: s.id, mode: 'edit' });
    setForm({ name: s.name, department: s.department, cgpa: s.cgpa ?? '', email: s.email, phone: s.phone ?? '' });
  };

  const downloadTemplate = () => {
    const headers = 'deptNo,name,password,department,cgpa,email,phone';
    const sample = 'STU001,John Doe,25/02/2005,CSE,8.5,john@example.com,9876543210';
    const csv = [headers, sample].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const doBulkImport = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Select a CSV or Excel file');
      return;
    }
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', importFile);
    try {
      const { data } = await adminApi.post('/students/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(data);
      toast.success(`Imported ${data.created} students`);
      if (data.created > 0) fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 mt-1">View, add, edit, delete</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImportModal(true)} className="btn-secondary">Bulk import</button>
          <button onClick={() => { setModal({ mode: 'create' }); setForm({ deptNo: '', name: '', password: '', department: '', cgpa: '', email: '', phone: '' }); }} className="btn-primary">
            Add student
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name / dept no / email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="px-4 py-2 rounded-lg border border-slate-200 w-64"
        />
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setOffset(0); }}
          className="px-4 py-2 rounded-lg border border-slate-200 w-40"
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={LIMIT} cols={6} />
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No students found</p>
            <p className="text-slate-400 text-sm mt-1">Add students or adjust filters</p>
            <button onClick={() => { setSearch(''); setDepartment(''); setOffset(0); fetch(); }} className="mt-4 btn-secondary">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Dept No</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">CGPA</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="table-row-hover border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4">{s.deptNo}</td>
                    <td className="py-3 px-4">{s.name}</td>
                    <td className="py-3 px-4">{s.department}</td>
                    <td className="py-3 px-4">{s.cgpa ?? '—'}</td>
                    <td className="py-3 px-4">{s.email}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setContextStudentId(s.id)} className="text-primary-600 text-sm font-medium mr-3 hover:underline">View</button>
                      <button onClick={() => openEdit(s)} className="text-primary-600 text-sm font-medium mr-3 hover:underline">Edit</button>
                      <button onClick={() => remove(s.id)} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="text-sm text-slate-500">
          Showing {list.length === 0 ? 0 : offset + 1}–{offset + list.length} of {totalCount}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setOffset((o) => Math.max(0, o - LIMIT))} disabled={offset === 0} className="btn-secondary disabled:opacity-50">Previous</button>
          <button onClick={() => setOffset((o) => o + LIMIT)} disabled={offset + list.length >= totalCount} className="btn-secondary disabled:opacity-50">Next</button>
        </div>
      </div>

      {contextStudentId && <StudentContextPanel studentId={contextStudentId} onClose={() => setContextStudentId(null)} />}

      {importModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setImportModal(false); setImportResult(null); setImportFile(null); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Bulk import students</h2>
            <p className="text-slate-500 text-sm mb-4">Upload a CSV or Excel file with columns: deptNo, name, password, department, cgpa, email, phone</p>
            <a href="#" onClick={(e) => { e.preventDefault(); downloadTemplate(); }} className="text-primary-600 text-sm font-medium hover:underline block mb-4">Download CSV template</a>
            <form onSubmit={doBulkImport} className="space-y-3">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setImportFile(e.target.files?.[0])} className="w-full text-sm" />
              {importResult && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-700">Created: {importResult.created}</p>
                  {importResult.errors?.length > 0 && (
                    <p className="text-amber-600 mt-1">Errors: {importResult.errors.length} row(s) – {importResult.errors.slice(0, 3).map((e) => `Row ${e.row}: ${e.message}`).join('; ')}{importResult.errors.length > 3 ? '…' : ''}</p>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={importing} className="btn-primary flex-1 disabled:opacity-50">{importing ? 'Importing…' : 'Import'}</button>
                <button type="button" onClick={() => { setImportModal(false); setImportResult(null); setImportFile(null); }} className="btn-secondary">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">{modal.mode === 'create' ? 'Add student' : 'Edit student'}</h2>
            <form onSubmit={modal.mode === 'create' ? create : update} className="space-y-3">
              {modal.mode === 'create' && (
                <>
                  <input required placeholder="Dept No" value={form.deptNo} onChange={(e) => setForm((f) => ({ ...f, deptNo: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                  <input required placeholder="DOB password (DD/MM/YYYY)" type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                </>
              )}
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
              <input required placeholder="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
              <input placeholder="CGPA" type="number" step="0.01" value={form.cgpa} onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
