import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/axios';

export default function AdminNotifications() {
  const [drives, setDrives] = useState([]);
  const [target, setTarget] = useState('all');
  const [department, setDepartment] = useState('');
  const [driveId, setDriveId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const NOTIFICATION_TEMPLATES = [
    { name: 'Drive reminder', title: 'Drive reminder', message: 'This is a reminder about the upcoming placement drive. Please ensure your profile and resume are updated.', link: '/student/drives' },
    { name: 'Shortlist result', title: 'Shortlist update', message: 'The shortlist for the drive has been published. Check your application status in the portal.', link: '/student/applications' },
    { name: 'Event reminder', title: 'Event reminder', message: 'You have an upcoming event. Please be present at the scheduled time and venue.', link: '/student/events' },
    { name: 'Offer deadline', title: 'Offer response required', message: 'Your offer letter is pending response. Please accept or reject before the deadline.', link: '/student/offers' },
  ];

  const applyTemplate = (t) => {
    setTitle(t.title);
    setMessage(t.message);
    setLink(t.link);
  };

  useEffect(() => {
    adminApi.get('/drives').then(({ data }) => setDrives(data.drives || [])).catch(() => {});
  }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title required');
      return;
    }
    setSending(true);
    try {
      const { data } = await adminApi.post('/notifications/broadcast', {
        target,
        department: target === 'department' ? department : undefined,
        driveId: (target === 'drive' || target === 'selected') ? driveId : undefined,
        title: title.trim(),
        message: message.trim() || undefined,
        link: link.trim() || undefined,
      });
      toast.success(`Sent to ${data.count} students`);
      setTitle('');
      setMessage('');
      setLink('');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Send notification</h1>
        <p className="text-slate-500 mt-1">Broadcast to students</p>
      </div>
      <form onSubmit={send} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
            onChange={(e) => {
              const t = NOTIFICATION_TEMPLATES.find((x) => x.name === e.target.value);
              if (t) applyTemplate(t);
            }}
          >
            <option value="">Choose a template (optional)</option>
            {NOTIFICATION_TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200">
            <option value="all">All students</option>
            <option value="department">By department</option>
            <option value="drive">Drive applicants</option>
            <option value="selected">Selected (in drive)</option>
          </select>
        </div>
        {target === 'department' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE" className="w-full px-4 py-2 rounded-lg border border-slate-200" />
          </div>
        )}
        {(target === 'drive' || target === 'selected') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Drive</label>
            <select value={driveId} onChange={(e) => setDriveId(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200">
              <option value="">Select drive</option>
              {drives.map((d) => <option key={d.id} value={d.id}>{d.companyName} – {d.role}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="w-full px-4 py-2 rounded-lg border border-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional message" className="w-full px-4 py-2 rounded-lg border border-slate-200" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
          <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g. /student/drives" className="w-full px-4 py-2 rounded-lg border border-slate-200" />
        </div>
        <button type="submit" disabled={sending} className="btn-primary w-full">Send notification</button>
      </form>
    </div>
  );
}
