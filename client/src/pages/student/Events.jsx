import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/axios';
import { CardGridSkeleton } from '../../components/Skeleton';

const TYPE_LABELS = { DRIVE: 'Placement Drive', WORKSHOP: 'Workshop', TRAINING: 'Training', TALK: 'Pre-placement Talk', DEADLINE: 'Deadline' };
const TYPE_COLORS = { DRIVE: 'bg-blue-100 text-blue-800', WORKSHOP: 'bg-amber-100 text-amber-800', TRAINING: 'bg-emerald-100 text-emerald-800', TALK: 'bg-violet-100 text-violet-800', DEADLINE: 'bg-rose-100 text-rose-800' };

function CalendarGrid({ events, currentMonth, onRegister, onUnregister, onSelectEvent }) {
  const { weeks, monthLabel } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    const remainder = 7 - (days.length % 7);
    if (remainder < 7) for (let i = 0; i < remainder; i++) days.push(null);
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    return { weeks, monthLabel };
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const d = new Date(e.startTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const dayKey = (d) => (d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : '');

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 text-center">{monthLabel}</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500">
              {day}
            </div>
          ))}
          {weeks.flat().map((d, i) => {
            const key = dayKey(d);
            const dayEvents = d ? (eventsByDay[key] || []) : [];
            const isToday = d && (() => { const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); })();
            return (
              <div
                key={i}
                className={`min-h-[80px] bg-white p-1.5 ${!d ? 'bg-slate-50/50' : ''} ${isToday ? 'ring-2 ring-primary-500 ring-inset rounded' : ''}`}
              >
                {d && (
                  <>
                    <div className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-slate-700'}`}>{d.getDate()}</div>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => onSelectEvent(e)}
                          className="w-full text-left truncate text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100"
                          title={e.title}
                        >
                          {e.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-xs text-slate-500 pl-1">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = () => {
    studentApi.get('/events').then(({ data }) => setEvents(data.events || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    studentApi.get('/events').then(({ data }) => setEvents(data.events || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const register = async (eventId) => {
    try {
      await studentApi.post(`/events/${eventId}/register`);
      toast.success('Registered');
      const { data } = await studentApi.get('/events');
      setEvents(data.events || []);
      setSelectedEvent((prev) => (prev && prev.id === eventId ? { ...prev, registered: true } : prev));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  const unregister = async (eventId) => {
    try {
      await studentApi.delete(`/events/${eventId}/register`);
      toast.success('Unregistered');
      const { data } = await studentApi.get('/events');
      setEvents(data.events || []);
      setSelectedEvent((prev) => (prev && prev.id === eventId ? { ...prev, registered: false } : prev));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <CardGridSkeleton count={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Events & Calendar</h1>
          <p className="text-slate-500 mt-1">Company drives, pre-placement talks, workshops, and deadlines</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            List
          </button>
        </div>
      </div>

      {view === 'calendar' && (
        <>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-medium text-slate-700">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <CalendarGrid
            events={events}
            currentMonth={currentMonth}
            onRegister={register}
            onUnregister={unregister}
            onSelectEvent={setSelectedEvent}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200" /> Placement drive</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-200" /> Workshop</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-200" /> Deadline</span>
          </div>
        </>
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">No upcoming events.</div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm card-hover">
                <span className={`text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded ${TYPE_COLORS[e.type] || 'bg-slate-100 text-slate-700'}`}>{TYPE_LABELS[e.type] || e.type}</span>
                <h3 className="font-semibold text-slate-800 mt-1">{e.title}</h3>
                <p className="text-sm text-slate-500 mt-2">
                  {new Date(e.startTime).toLocaleString()} – {new Date(e.endTime).toLocaleTimeString()}
                </p>
                {e.location && <p className="text-sm text-slate-500">{e.location}</p>}
                {e.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{e.description}</p>}
                <div className="mt-4">
                  {e.registered ? (
                    <button onClick={() => unregister(e.id)} className="btn-secondary text-sm">Unregister</button>
                  ) : (
                    <button onClick={() => register(e.id)} className="btn-primary text-sm">Register</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <span className={`text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded ${TYPE_COLORS[selectedEvent.type] || 'bg-slate-100'}`}>{TYPE_LABELS[selectedEvent.type] || selectedEvent.type}</span>
              <button type="button" onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <h3 className="font-semibold text-slate-800 mt-2">{selectedEvent.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{new Date(selectedEvent.startTime).toLocaleString()} – {new Date(selectedEvent.endTime).toLocaleTimeString()}</p>
            {selectedEvent.location && <p className="text-sm text-slate-600 mt-1">{selectedEvent.location}</p>}
            {selectedEvent.description && <p className="text-sm text-slate-600 mt-2">{selectedEvent.description}</p>}
            <div className="mt-4">
              {selectedEvent.registered ? (
                <button onClick={() => unregister(selectedEvent.id)} className="btn-secondary w-full">Unregister</button>
              ) : (
                <button onClick={() => register(selectedEvent.id)} className="btn-primary w-full">Register for this event</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
