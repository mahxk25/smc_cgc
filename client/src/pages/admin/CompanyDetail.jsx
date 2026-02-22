import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminCompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [drives, setDrives] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      adminApi.get(`/companies/${id}`),
      adminApi.get('/drives'),
      adminApi.get(`/companies/${id}/notes`),
    ])
      .then(([c, d, n]) => {
        setCompany(c.data);
        setDrives((d.data.drives || []).filter((dr) => Number(dr.companyId) === Number(id)));
        setNotes(n.data.notes || []);
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, [id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await adminApi.post(`/companies/${id}/notes`, { note: newNote.trim() });
      toast.success('Note added');
      setNewNote('');
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  if (loading && !company) return <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />;
  if (!company) return <div className="p-8 text-slate-500">Company not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[
        { label: 'Companies', to: '/admin/companies' },
        { label: company.name },
      ]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{company.name}</h1>
        <p className="text-slate-500 mt-1">Company details and notes</p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Details</h2>
        <div className="grid gap-2 text-sm">
          {company.industry && <p><span className="text-slate-500">Industry</span> <span className="font-medium">{company.industry}</span></p>}
          {company.contactPerson && <p><span className="text-slate-500">Contact</span> <span className="font-medium">{company.contactPerson}</span></p>}
          {company.contactEmail && <p><span className="text-slate-500">Email</span> <span className="font-medium">{company.contactEmail}</span></p>}
          {company.contactPhone && <p><span className="text-slate-500">Phone</span> <span className="font-medium">{company.contactPhone}</span></p>}
          {company.salaryPackage && <p><span className="text-slate-500">Salary package</span> <span className="font-medium">{company.salaryPackage}</span></p>}
          {company.jobDescription && <p><span className="text-slate-500">Job description</span> <span className="block mt-1">{company.jobDescription}</span></p>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">Drives</h2>
        {drives.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No drives for this company.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {drives.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80">
                <span className="font-medium">{d.role}</span>
                <span className="text-slate-500 text-sm">{d.status}</span>
                <Link to={`/admin/drives/${d.id}/students`} className="text-primary-600 text-sm font-medium hover:underline">Students</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">Notes</h2>
        <form onSubmit={addNote} className="p-4 border-b border-slate-100 flex gap-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200"
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>
        {notes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No notes yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notes.map((n) => (
              <li key={n.id} className="px-6 py-4">
                <p className="text-slate-800">{n.note}</p>
                <p className="text-slate-400 text-xs mt-1">{n.adminUsername} · {new Date(n.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
