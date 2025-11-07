import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlay, FiPause, FiStopCircle, FiClock, FiTag, FiFilter, FiChevronDown, FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import './Tracking.css';
import { timeTrackingAPI } from '../services/api';

const projects = ['Website Revamp', 'Mobile App', 'API Backend', 'Marketing'];
const members = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Lee'];

const sampleEntries = [
  { id: 'tt-1', date: '2025-11-05', project: 'Website Revamp', task: 'Landing page', member: 'John Doe', notes: 'Hero section', seconds: 2*3600 + 15*60 },
  { id: 'tt-2', date: '2025-11-06', project: 'API Backend', task: 'Auth endpoints', member: 'Jane Smith', notes: 'JWT refresh', seconds: 3*3600 + 5*60 },
  { id: 'tt-3', date: '2025-11-06', project: 'Mobile App', task: 'Onboarding', member: 'Alex Johnson', notes: 'Animations', seconds: 55*60 },
  { id: 'tt-4', date: '2025-11-07', project: 'Website Revamp', task: 'Contact form', member: 'Sarah Lee', notes: 'Validation', seconds: 1*3600 + 25*60 },
];

function fmtHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function Tracking() {
  const [entries, setEntries] = useState(sampleEntries);
  const [filterProject, setFilterProject] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [range, setRange] = useState({ from: '', to: '' });

  // Timer state
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState({ project: projects[0], task: '', member: members[0], notes: '' });
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Modal for add/edit manual entry
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ date: '', project: projects[0], task: '', member: members[0], notes: '', hours: 0, minutes: 30 });

  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await timeTrackingAPI.getAll();
      setTimeEntries(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async (data) => {
    try {
      await timeTrackingAPI.start(data);
      fetchTimeEntries();
    } catch (error) {
      alert('Error starting timer');
    }
  };

  const handleStopTimer = async (id) => {
    try {
      await timeTrackingAPI.stop(id);
      fetchTimeEntries();
    } catch (error) {
      alert('Error stopping timer');
    }
  };

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  const start = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
  };
  const pause = () => { setRunning(false); clearInterval(timerRef.current); };
  const reset = () => { setRunning(false); clearInterval(timerRef.current); setSeconds(0); };
  const stopAndLog = () => {
    if (seconds === 0) return;
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const entry = { id: `tt-${Date.now()}`, date, project: current.project, task: current.task || 'General', member: current.member, notes: current.notes, seconds };
    setEntries(prev => [entry, ...prev]);
    reset();
  };

  const totalSeconds = useMemo(() => entries.reduce((sum,e) => sum + e.seconds, 0), [entries]);
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }, []);
  const todaySeconds = useMemo(() => entries.filter(e => e.date === todayKey).reduce((s,e)=> s+e.seconds, 0), [entries, todayKey]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filterProject !== 'all' && e.project !== filterProject) return false;
      if (filterMember !== 'all' && e.member !== filterMember) return false;
      if (range.from && e.date < range.from) return false;
      if (range.to && e.date > range.to) return false;
      return true;
    });
  }, [entries, filterProject, filterMember, range]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    filtered.forEach(e => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return Array.from(map.entries()).sort((a,b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const openAdd = (entry) => {
    if (entry) {
      setEditingId(entry.id);
      const hours = Math.floor(entry.seconds/3600);
      const minutes = Math.round((entry.seconds%3600)/60);
      setForm({ date: entry.date, project: entry.project, task: entry.task, member: entry.member, notes: entry.notes, hours, minutes });
    } else {
      setEditingId(null);
      setForm({ date: '', project: projects[0], task: '', member: members[0], notes: '', hours: 0, minutes: 30 });
    }
    setShowModal(true);
  };

  const saveEntry = () => {
    const secs = (Number(form.hours)||0)*3600 + (Number(form.minutes)||0)*60;
    if (!form.date || secs <= 0) return;
    const base = { id: editingId || `tt-${Date.now()}`, date: form.date, project: form.project, task: form.task || 'General', member: form.member, notes: form.notes, seconds: secs };
    setEntries(prev => {
      const others = prev.filter(e => e.id !== base.id);
      return [base, ...others].sort((a,b) => b.id.localeCompare(a.id));
    });
    setShowModal(false);
  };

  const deleteEntry = (id) => { if (window.confirm('Delete this entry?')) setEntries(prev => prev.filter(e => e.id !== id)); };

  return (
    <div className="track-container">
      <div className="track-header">
        <div>
          <h2>Time Tracking</h2>
          <p>Track time with a live timer, manage timesheets, and view daily/weekly totals.</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => openAdd(null)}><FiPlus/> Add Entry</button>
        </div>
      </div>

      {/* Timer */}
      <div className="timer-card">
        <div className="timer-left">
          <div className="hms"><FiClock/> {fmtHMS(seconds)}</div>
          <div className="timer-controls">
            {!running ? (
              <button className="btn success" onClick={start}><FiPlay/> Start</button>
            ) : (
              <button className="btn warning" onClick={pause}><FiPause/> Pause</button>
            )}
            <button className="btn" onClick={reset}><FiStopCircle/> Reset</button>
            <button className="btn primary" onClick={stopAndLog} disabled={seconds===0}><FiTag/> Log Time</button>
          </div>
        </div>
        <div className="timer-right">
          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select value={current.project} onChange={e=>setCurrent({...current, project:e.target.value})}>
                {projects.map(p=> <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Task</label>
              <input value={current.task} onChange={e=>setCurrent({...current, task:e.target.value})} placeholder="What are you doing?"/>
            </div>
            <div className="form-group">
              <label>Member</label>
              <select value={current.member} onChange={e=>setCurrent({...current, member:e.target.value})}>
                {members.map(m=> <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={current.notes} onChange={e=>setCurrent({...current, notes:e.target.value})} placeholder="Optional notes"/>
          </div>
        </div>
        <div className="timer-summary">
          <div className="sum-item">
            <div className="sum-label">Today</div>
            <div className="sum-value">{fmtHMS(todaySeconds)}</div>
          </div>
          <div className="sum-item">
            <div className="sum-label">All Time</div>
            <div className="sum-value">{fmtHMS(totalSeconds)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter">
          <FiFilter className="icon"/>
          <select value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <FiChevronDown className="chev"/>
        </div>
        <div className="filter">
          <select value={filterMember} onChange={e=>setFilterMember(e.target.value)}>
            <option value="all">All Members</option>
            {members.map(m=> <option key={m} value={m}>{m}</option>)}
          </select>
          <FiChevronDown className="chev"/>
        </div>
        <div className="daterange">
          <FiCalendar className="icon"/>
          <input type="date" value={range.from} onChange={e=>setRange(r=>({...r, from:e.target.value}))}/>
          <span>to</span>
          <input type="date" value={range.to} onChange={e=>setRange(r=>({...r, to:e.target.value}))}/>
        </div>
      </div>

      {/* Timesheet */}
      <div className="sheet">
        <div className="sheet-header">
          <div>Date</div>
          <div>Project</div>
          <div>Task</div>
          <div>Member</div>
          <div>Notes</div>
          <div className="right">Duration</div>
          <div className="right">Actions</div>
        </div>
        <div className="sheet-body">
          {groupedByDate.map(([date, items]) => (
            <div key={date} className="date-group">
              <div className="date-row"><span>{date}</span><span className="total">{fmtHMS(items.reduce((s,e)=>s+e.seconds,0))}</span></div>
              {items.map(e => (
                <div key={e.id} className="sheet-row">
                  <div>{e.date}</div>
                  <div>{e.project}</div>
                  <div className="truncate" title={e.task}>{e.task}</div>
                  <div>{e.member}</div>
                  <div className="truncate" title={e.notes}>{e.notes || '—'}</div>
                  <div className="right mono">{fmtHMS(e.seconds)}</div>
                  <div className="right actions">
                    <button className="icon-btn" title="Edit" onClick={()=>openAdd(e)}><FiEdit2/></button>
                    <button className="icon-btn" title="Delete" onClick={()=>deleteEntry(e.id)}><FiTrash2/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Entry' : 'Add Entry'}</h3>
              <button className="close" onClick={()=>setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select value={form.project} onChange={e=>setForm({...form, project:e.target.value})}>
                    {projects.map(p=> <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Task</label>
                  <input value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Task name"/>
                </div>
                <div className="form-group">
                  <label>Member</label>
                  <select value={form.member} onChange={e=>setForm({...form, member:e.target.value})}>
                    {members.map(m=> <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Optional"/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Hours</label>
                  <input type="number" min="0" value={form.hours} onChange={e=>setForm({...form, hours:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Minutes</label>
                  <input type="number" min="0" max="59" value={form.minutes} onChange={e=>setForm({...form, minutes:e.target.value})}/>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveEntry} disabled={!form.date || ((Number(form.hours)||0)===0 && (Number(form.minutes)||0)===0)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
