import React, { useMemo, useState } from 'react';
import { FiFilter, FiChevronDown, FiSearch, FiFlag, FiUsers, FiCalendar } from 'react-icons/fi';
import './ProjectProgress.css';

const projects = [
  { id: 'p1', name: 'Website Revamp', manager: 'John Doe', due: '2025-12-10', status: 'On Track', progress: 72, team: 8, milestones: [
    { t: 'Kickoff', d: '2025-10-01' }, { t: 'Design', d: '2025-10-20' }, { t: 'Dev', d: '2025-11-20' }, { t: 'Launch', d: '2025-12-10' }
  ]},
  { id: 'p2', name: 'Mobile App', manager: 'Jane Smith', due: '2026-01-15', status: 'At Risk', progress: 44, team: 6, milestones: [
    { t: 'MVP', d: '2025-11-30' }, { t: 'Beta', d: '2025-12-20' }, { t: 'Release', d: '2026-01-15' }
  ]},
  { id: 'p3', name: 'API Backend', manager: 'Alex Johnson', due: '2025-11-30', status: 'Delayed', progress: 58, team: 5, milestones: [
    { t: 'Auth', d: '2025-10-25' }, { t: 'Core', d: '2025-11-15' }, { t: 'Docs', d: '2025-11-28' }
  ]},
];

export default function ProjectProgress() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => projects.filter(p => {
    const okQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const okS = status === 'all' || p.status === status;
    return okQ && okS;
  }), [q, status]);

  return (
    <div className="rep-container">
      <div className="rep-header">
        <div>
          <h2>Project Progress</h2>
          <p>Track progress, health and milestones across all projects.</p>
        </div>
        <div className="filters">
          <div className="search">
            <FiSearch className="icon" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search projects..." />
          </div>
          <div className="select">
            <FiFilter className="icon" />
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option>On Track</option>
              <option>At Risk</option>
              <option>Delayed</option>
            </select>
            <FiChevronDown className="chev" />
          </div>
        </div>
      </div>

      <div className="cards">
        {filtered.map(p => (
          <div key={p.id} className={`proj-card ${p.status.replace(/\s/g,'').toLowerCase()}`}>
            <div className="card-head">
              <div className="title">{p.name}</div>
              <div className="status">{p.status}</div>
            </div>
            <div className="meta">
              <div className="m"><FiUsers/> {p.team} members</div>
              <div className="m"><FiFlag/> {p.manager}</div>
              <div className="m"><FiCalendar/> Due {p.due}</div>
            </div>
            <div className="progress">
              <div className="bar"><div className="fill" style={{width: `${p.progress}%`}} /></div>
              <div className="pct">{p.progress}%</div>
            </div>
            <div className="timeline">
              {p.milestones.map((m, i) => (
                <div key={i} className="milestone">
                  <div className="dot" />
                  <div className="ml-body">
                    <div className="ml-title">{m.t}</div>
                    <div className="ml-date">{m.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

