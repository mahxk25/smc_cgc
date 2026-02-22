import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../api/axios';
import { CardGridSkeleton } from '../../components/Skeleton';

const StatCard = ({ icon, title, value, sub, to, gradient, delay = 0 }) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-slate-200/80"
    style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.02)', animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20 ${gradient}`} />
    <div className="relative">
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${gradient} text-white shadow-lg mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
      {to && (
        <Link to={to} className="inline-flex items-center gap-1.5 mt-4 text-primary-600 font-semibold text-sm hover:gap-2 transition-all">
          Open <span className="group-hover:translate-x-0.5 inline-block">→</span>
        </Link>
      )}
    </div>
  </div>
);

export default function StudentDashboard() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.get('/me').then(({ data }) => setMe(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <CardGridSkeleton count={4} />;
  if (!me) return <div className="text-slate-500">Could not load profile.</div>;

  const cards = [
    {
      title: 'My Profile',
      value: me.name,
      sub: me.deptNo + ' · ' + me.department,
      to: null,
      gradient: 'bg-gradient-to-br from-primary-500 to-primary-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
    {
      title: 'Applications',
      value: 'Track status',
      sub: 'View timeline',
      to: '/student/applications',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      title: 'Offers',
      value: 'View & respond',
      sub: 'Accept or reject',
      to: '/student/offers',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414A1 1 0 0118.414 7H20a2 2 0 012 2v11a2 2 0 01-2 2z" /></svg>,
    },
    {
      title: 'Events',
      value: 'Calendar',
      sub: 'Register for workshops',
      to: '/student/events',
      gradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 px-8 py-10 text-white" style={{ boxShadow: '0 20px 40px -12px rgb(37 99 235 / 0.35)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium uppercase tracking-widest">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 tracking-tight">Welcome back, {me.name}</h1>
          <p className="text-primary-100 mt-2 text-lg">{me.department} · {me.deptNo}</p>
        </div>
      </div>

      {!me.canApply && me.canApplyReason && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-6 py-4 text-amber-800 text-sm font-medium shadow-premium">
          {me.canApplyReason}
        </div>
      )}

      {/* Stat cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <StatCard key={i} {...card} delay={i * 50} />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-premium">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Quick actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/student/drives" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200 hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Browse drives
          </Link>
          <Link to="/student/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-premium transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            View events
          </Link>
          <Link to="/student/notifications" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-premium transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
