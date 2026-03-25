import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/axios';
import { CardGridSkeleton } from '../../components/Skeleton';

const StatCard = ({ icon, title, value, to, gradient, delay = 0, subtitle }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-slate-200/80 block"
    style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.02)', animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20 ${gradient}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${gradient} text-white shadow-lg mb-4`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        <span className="inline-flex items-center gap-1.5 mt-4 text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
          View <span className="group-hover:translate-x-0.5 inline-block">→</span>
        </span>
      </div>
    </div>
  </Link>
);

function isNetworkError(err) {
  return err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error');
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [expiringOffers, setExpiringOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const expectedDashboardKeys = [
    'totalStudents',
    'placed',
    'totalCompanies',
    'totalDrives',
    'upcomingDrives',
    'totalEvents',
    'upcomingEvents',
    'expiringOffersCount',
    'topCompanies',
  ];

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    Promise.all([
      adminApi.get('/dashboard'),
      adminApi.get('/expiring-offers').catch(() => ({ data: { offers: [] } })),
    ])
      .then(([dash, offers]) => {
        const payload = dash?.data;
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
          const ct = dash?.headers?.['content-type'] || dash?.headers?.['Content-Type'] || 'unknown';
          const snippet = typeof payload === 'string' ? payload.slice(0, 200) : JSON.stringify(payload)?.slice(0, 200);
          setDebugInfo({ contentType: ct, snippet });
          setError('invalid_payload');
          setData(null);
          return;
        }
        const missing = expectedDashboardKeys.filter((k) => !(k in payload));
        if (missing.length) {
          const ct = dash?.headers?.['content-type'] || dash?.headers?.['Content-Type'] || 'unknown';
          setDebugInfo({ contentType: ct, missingKeys: missing, snippet: JSON.stringify(payload)?.slice(0, 200) });
          setError('invalid_payload');
          setData(null);
          return;
        }
        setData(payload);
        setExpiringOffers(offers.data?.offers ?? []);
        setLastUpdatedAt(new Date());
      })
      .catch((err) => setError(isNetworkError(err) ? 'backend_unreachable' : 'failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Keep dashboard "live" by refreshing periodically.
  useEffect(() => {
    const t = setInterval(() => {
      fetchDashboard();
    }, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <CardGridSkeleton count={4} />;

  if (error === 'backend_unreachable') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Backend server not running</h2>
        <p className="text-slate-600 mt-2 text-sm">
          The API could not be reached. Start the backend in a separate terminal:
        </p>
        <code className="mt-3 block text-left bg-slate-800 text-slate-100 px-4 py-3 rounded-xl text-sm font-mono">
          cd smc-career-connect/server<br />
          npm run dev
        </code>
        <p className="text-slate-500 text-xs mt-3">Then click Retry below.</p>
        <button
          type="button"
          onClick={fetchDashboard}
          className="mt-5 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        {error === 'invalid_payload' ? (
          <div className="space-y-2">
            <p className="text-slate-800 font-semibold">Dashboard API returned an invalid response</p>
            <p className="text-slate-600 text-sm">
              This usually means the frontend is not reaching the backend proxy, or the backend returned non-JSON.
            </p>
            {debugInfo && (
              <div className="mt-4 text-left text-sm bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-slate-700"><span className="font-semibold">Content-Type:</span> {debugInfo.contentType}</div>
                {debugInfo.missingKeys && (
                  <div className="text-slate-700 mt-2">
                    <span className="font-semibold">Missing keys:</span> {debugInfo.missingKeys.join(', ')}
                  </div>
                )}
                {debugInfo.snippet && (
                  <div className="text-slate-700 mt-2">
                    <span className="font-semibold">Response snippet:</span>
                    <div className="mt-1 font-mono text-xs text-slate-600 whitespace-pre-wrap">{debugInfo.snippet}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-600">Could not load dashboard.</p>
        )}
        <button type="button" onClick={fetchDashboard} className="mt-4 text-primary-600 font-medium hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const safe = {
    totalStudents: Number(data.totalStudents ?? 0),
    placed: Number(data.placed ?? 0),
    totalCompanies: Number(data.totalCompanies ?? 0),
    totalDrives: Number(data.totalDrives ?? 0),
    upcomingDrives: Number(data.upcomingDrives ?? 0),
    totalEvents: Number(data.totalEvents ?? 0),
    upcomingEvents: Number(data.upcomingEvents ?? 0),
    expiringOffersCount: Number(data.expiringOffersCount ?? 0),
    topCompanies: Array.isArray(data.topCompanies) ? data.topCompanies : [],
  };

  const showDashForZero = (n) => (Number(n) === 0 ? '—' : String(n));

  const stats = [
    {
      title: 'Students',
      value: showDashForZero(safe.totalStudents),
      to: '/admin/students',
      gradient: 'bg-gradient-to-br from-primary-500 to-primary-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
    {
      title: 'Placed',
      value: showDashForZero(safe.placed),
      to: '/admin/drives',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      subtitle: safe.placed === 0 ? 'No selected applications yet' : undefined,
    },
    {
      title: 'Drives',
      value: showDashForZero(safe.totalDrives),
      to: '/admin/drives',
      gradient: 'bg-gradient-to-br from-slate-700 to-slate-900',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
    {
      title: 'Upcoming drives',
      value: showDashForZero(safe.upcomingDrives),
      to: '/admin/drives',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
    {
      title: 'Events',
      value: showDashForZero(safe.totalEvents),
      to: '/admin/events',
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      title: 'Upcoming events',
      value: showDashForZero(safe.upcomingEvents),
      to: '/admin/events',
      gradient: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      title: 'Companies',
      value: showDashForZero(safe.totalCompanies),
      to: '/admin/companies',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a2 2 0 012-2h3v16m4 0V4a2 2 0 012-2h3v19" /></svg>,
    },
    {
      title: 'Offers expiring (48h)',
      value: showDashForZero(safe.expiringOffersCount),
      to: '/admin/placement-report',
      gradient: 'bg-gradient-to-br from-rose-500 to-rose-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 px-8 py-10 text-white" style={{ boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.25)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.2)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Placement Office</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mt-1 tracking-tight">Dashboard</h1>
              <p className="text-slate-400 mt-2 text-lg">Overview of placements and drives</p>
              {lastUpdatedAt && (
                <p className="text-slate-400/90 mt-2 text-sm">
                  Last updated: {lastUpdatedAt.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold transition-colors"
              title="Refresh dashboard"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Live dashboard */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Live dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} delay={i * 50} />
          ))}
        </div>

        {/* Expiring offers list */}
        {expiringOffers.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-premium">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Offers expiring in 48 hours</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {expiringOffers.slice(0, 10).map((o) => (
                <li key={o.id} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50/80 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800">{o.studentName} ({o.deptNo})</p>
                    <p className="text-sm text-slate-500">{o.companyName} – {o.driveRole}</p>
                  </div>
                  <span className="text-sm text-slate-500">{new Date(o.offerDeadline).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top companies */}
        {safe.topCompanies.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-premium">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Top companies</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {safe.topCompanies.map((c, i) => (
                <li key={i} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-800">{c.name}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-primary-700 font-semibold text-sm">
                    {c.count} placed
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
