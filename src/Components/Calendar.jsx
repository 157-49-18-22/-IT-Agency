import React, { useEffect, useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiPlus,
  FiX,
  FiClock,
  FiMapPin,
  FiTag,
  FiSearch
} from 'react-icons/fi';
import './Calendar.css';
import { calendarAPI } from '../services/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const sampleEvents = [
  { id: 'e1', title: 'Sprint Planning', date: '2025-11-07', time: '10:00', location: 'Meet #1', tag: 'Meeting', color: '#6366f1' },
  { id: 'e2', title: 'Client Demo', date: '2025-11-10', time: '16:00', location: 'Zoom', tag: 'Client', color: '#10b981' },
  { id: 'e3', title: 'Release v1.2', date: '2025-11-15', time: '12:30', location: 'Prod', tag: 'Release', color: '#f59e0b' },
  { id: 'e4', title: 'Team Outing', date: '2025-11-20', time: '18:00', location: 'City Park', tag: 'Team', color: '#ef4444' },
];

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Calendar() {
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: formatDateKey(new Date()),
    time: '',
    location: '',
    tag: '', // We will treat this as 'description' or 'type' logic if needed, but adding a specific type field is better
    type: 'Meeting',
    color: '#4f46e5'
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await calendarAPI.getEvents();
      if (res.data.success) {
        const mappedEvents = res.data.data.map(e => {
          const d = new Date(e.startDate);
          return {
            id: e.id,
            title: e.title,
            date: formatDateKey(d),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            location: e.location,
            tag: e.type, // Display type as tag
            color: e.color,
            description: e.description
          };
        });
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // ensure selected is visible month when navigating
    const s = new Date(selected);
    s.setHours(0, 0, 0, 0);
    setSelected(s);
  }, []); // Keeping this as empty dependency to run once or strictly when needed logic? 
  // Actually the original code had [] which is wrong if it depends on selected? 
  // The original code set `selected` inside useEffect but depended on nothing? 
  // Ah, it was trying to sync state on mount? 
  // Let's keep it simple.

  const startOfMonth = useMemo(() => new Date(current.getFullYear(), current.getMonth(), 1), [current]);
  const endOfMonth = useMemo(() => new Date(current.getFullYear(), current.getMonth() + 1, 0), [current]);
  const leading = useMemo(() => startOfMonth.getDay(), [startOfMonth]);
  const daysInMonth = useMemo(() => endOfMonth.getDate(), [endOfMonth]);

  const gridDates = useMemo(() => {
    const dates = [];
    // previous month days
    const prevEnd = new Date(current.getFullYear(), current.getMonth(), 0).getDate();
    for (let i = leading - 1; i >= 0; i--) {
      const d = new Date(current.getFullYear(), current.getMonth() - 1, prevEnd - i);
      dates.push({ date: d, other: true });
    }
    // current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(current.getFullYear(), current.getMonth(), i);
      dates.push({ date: d, other: false });
    }
    // next month to fill 42 cells
    while (dates.length % 7 !== 0 || dates.length < 42) {
      const last = dates[dates.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      dates.push({ date: d, other: true });
    }
    return dates;
  }, [current, leading, daysInMonth]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (query && !`${e.title} ${e.location} ${e.tag}`.toLowerCase().includes(query.toLowerCase())) return;
      (map[e.date] ||= []).push(e);
    });
    return map;
  }, [events, query]);

  const selectedKey = formatDateKey(selected);
  const selectedDayEvents = eventsByDate[selectedKey] || [];

  const changeMonth = (dir) => {
    setCurrent(new Date(current.getFullYear(), current.getMonth() + dir, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCurrent(now);
    setSelected(now);
  };

  const openAdd = (d) => {
    const k = formatDateKey(d || selected);
    setForm({ title: '', date: k, time: '09:00', location: '', tag: '', type: 'Meeting', color: '#4f46e5' });
    setShowModal(true);
  };

  const saveEvent = async () => {
    if (!form.title.trim()) return;

    // Construct startDate and endDate
    // form.date is "YYYY-MM-DD", form.time is "HH:MM"
    const startDateTime = new Date(`${form.date}T${form.time || '00:00'}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    const payload = {
      title: form.title,
      startDate: startDateTime,
      endDate: endDateTime,
      type: form.type || 'Other',
      location: form.location,
      description: form.tag, // Storing tag in description or if we want to change tag usage
      color: form.color
    };

    try {
      const res = await calendarAPI.createEvent(payload);
      if (res.data.success) {
        await fetchEvents(); // Refresh list
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to save event", error);
      alert("Failed to save event");
    }
  };

  const deleteEvent = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await calendarAPI.deleteEvent(id);
        setEvents(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error("Failed to delete event", error);
        alert("Failed to delete event");
      }
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="title">
          <h2><FiCalendar /> Calendar</h2>
          <p>Plan events, track sprint milestones, and stay on schedule.</p>
        </div>
        <div className="header-actions">
          <button className="nav-btn" onClick={() => changeMonth(-1)}><FiChevronLeft /></button>
          <div className="month-label">{MONTHS[current.getMonth()]} {current.getFullYear()}</div>
          <button className="nav-btn" onClick={() => changeMonth(1)}><FiChevronRight /></button>
          <button className="primary-btn" onClick={goToday}>Today</button>
          <button className="primary-btn" onClick={() => openAdd(selected)}><FiPlus /> Add Event</button>
        </div>
      </div>

      <div className="calendar-body">
        <aside className="calendar-sidebar">
          <div className="sidebar-search">
            <FiSearch />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events..." />
          </div>
          <div className="mini-calendar">
            <div className="mini-header">{MONTHS[current.getMonth()].slice(0, 3)} {current.getFullYear()}</div>
            <div className="mini-grid">
              {WEEKDAYS.map(w => <div key={w} className="mini-week">{w[0]}</div>)}
              {gridDates.map(({ date, other }) => {
                const k = formatDateKey(date);
                const isToday = formatDateKey(today) === k;
                const isSel = formatDateKey(selected) === k;
                const count = (eventsByDate[k] || []).length;
                return (
                  <button key={k} className={`mini-cell ${other ? 'other' : ''} ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`}
                    onClick={() => setSelected(new Date(date))}
                  >
                    <span>{date.getDate()}</span>
                    {count > 0 && <span className="dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="upcoming">
            <div className="section-title">Upcoming</div>
            {loading ? <div style={{ padding: '10px', color: '#fff' }}>Loading...</div> : (
              <div className="upcoming-list">
                {events.slice(0, 6).map(e => (
                  <div className="up-item" key={e.id}>
                    <div className="up-title">{e.title}</div>
                    <div className="up-meta"><FiClock /> {e.date} {e.time || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="calendar-main">
          <div className="weekdays">
            {WEEKDAYS.map(d => <div key={d} className="weekday">{d}</div>)}
          </div>
          <div className="month-grid">
            {gridDates.map(({ date, other }) => {
              const k = formatDateKey(date);
              const isToday = formatDateKey(today) === k;
              const isSel = formatDateKey(selected) === k;
              const list = eventsByDate[k] || [];
              return (
                <div key={k} className={`day-cell ${other ? 'other' : ''} ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`}
                  onClick={() => setSelected(new Date(date))}
                >
                  <div className="day-number">{date.getDate()}</div>
                  <div className="events">
                    {list.slice(0, 3).map(ev => (
                      <div key={ev.id} className="event-chip" style={{ background: ev.color || '#e5e7eb' }} title={`${ev.title} • ${ev.time || ''}`}>
                        <span className="chip-text">{ev.title}</span>
                      </div>
                    ))}
                    {list.length > 3 && <div className="more">+{list.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="day-panel">
            <div className="day-panel-header">
              <div className="day-title">{MONTHS[selected.getMonth()]} {selected.getDate()}, {selected.getFullYear()}</div>
              <button className="primary-btn" onClick={() => openAdd(selected)}><FiPlus /> Add</button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <div className="empty">No events for this day.</div>
            ) : (
              <div className="event-list">
                {selectedDayEvents.map(ev => (
                  <div className="event-card" key={ev.id}>
                    <div className="ev-color" style={{ background: ev.color }} />
                    <div className="ev-body">
                      <div className="ev-title">{ev.title}</div>
                      <div className="ev-meta"><FiClock /> {ev.time || 'All day'} <FiMapPin /> {ev.location || '—'} <FiTag /> {ev.tag || '—'}</div>
                    </div>
                    <button className="icon-btn" onClick={() => deleteEvent(ev.id)} title="Delete"><FiX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Event</h3>
              <button className="close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="Meeting">Meeting</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Review">Review</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Where?" />
                </div>
                <div className="form-group">
                  <label>Description/Tag</label>
                  <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="Optional description" />
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveEvent} disabled={!form.title.trim() || loading}>
                {loading ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

