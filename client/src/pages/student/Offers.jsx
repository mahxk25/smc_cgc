import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/axios';
import { TableSkeleton } from '../../components/Skeleton';


export default function StudentOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.get('/offers').then(({ data }) => setOffers(data.offers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const decide = async (offerId, decision) => {
    try {
      await studentApi.post(`/offers/${offerId}/decision`, { decision });
      toast.success('Decision recorded');
      const { data } = await studentApi.get('/offers');
      setOffers(data.offers || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  const openDownload = async (offerId) => {
    try {
      const { data } = await studentApi.get(`/offers/${offerId}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offer_${offerId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Download failed');
    }
  };

  if (loading) return <TableSkeleton rows={4} cols={5} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Offers</h1>
        <p className="text-slate-500 mt-1">View, download, and accept/reject before deadline</p>
      </div>
      <div className="space-y-4">
        {offers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">No offers yet.</div>
        ) : (
          offers.map((o) => {
            const deadline = new Date(o.offerDeadline);
            const expired = deadline < new Date();
            const pending = o.decision === 'PENDING';
            return (
              <div key={o.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm card-hover">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{o.companyName} – {o.role}</h3>
                    <p className="text-sm text-slate-500 mt-1">Deadline: {deadline.toLocaleString()}</p>
                    <p className="mt-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        o.decision === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        o.decision === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.decision}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openDownload(o.id)} className="btn-secondary">Download PDF</button>
                    {pending && !expired && (
                      <>
                        <button onClick={() => decide(o.id, 'ACCEPT')} className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition">Accept</button>
                        <button onClick={() => decide(o.id, 'REJECT')} className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">Reject</button>
                      </>
                    )}
                    {pending && expired && <span className="text-amber-600 text-sm">Deadline passed</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
