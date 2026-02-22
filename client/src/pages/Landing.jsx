import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/40 to-blue-50/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 py-16 relative">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-xl shadow-primary-200/50 mb-8 animate-scale-in">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">SMC Career Connect</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-12">Your gateway to placements, events, and opportunities.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200/40 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-300/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Student Login
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-primary-200 text-primary-700 font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Admin / Placement Officer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
