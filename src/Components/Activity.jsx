import React, { useMemo, useState } from 'react';
import { FiCheckCircle, FiClipboard, FiFileText, FiGitCommit, FiMessageCircle, FiSearch, FiFilter, FiCalendar, FiClock, FiUser, FiGitBranch, FiAlertTriangle } from 'react-icons/fi';
import './Activity.css';

const seed = [
  { id:'A-2007', type:'Approval', title:'Deliverable approved: Mockups v2', project:'E-commerce Platform', user:'Client Approver', ts:'2025-11-06 18:10' },
  { id:'A-2006', type:'Task', title:'Task moved to Review: Build checkout UI', project:'E-commerce Platform', user:'Alex Johnson', ts:'2025-11-06 16:45' },
  { id:'A-2005', type:'Commit', title:'feat(api): add /orders endpoint', project:'API Backend', user:'Jane Smith', ts:'2025-11-06 15:12' },
  { id:'A-2004', type:'Comment', title:'Left feedback on Wireframes', project:'Website Revamp', user:'Sarah Lee', ts:'2025-11-05 19:34' },
  { id:'A-2003', type:'Testing', title:'Test run completed: Regression 1.0.3', project:'Mobile App', user:'QA Bot', ts:'2025-11-05 18:05' },
  { id:'A-2002', type:'Alert', title:'Overdue: UAT feedback pending', project:'Website Revamp', user:'System', ts:'2025-11-05 09:10' },
  { id:'A-2001', type:'Project', title:'Project created: API Backend', project:'API Backend', user:'Admin User', ts:'2025-11-04 10:00' },
];

const typeIcon = (t) => {
  switch(t){
    case 'Approval': return <FiCheckCircle/>;
    case 'Task': return <FiClipboard/>;
    case 'Commit': return <FiGitCommit/>;
    case 'Comment': return <FiMessageCircle/>;
    case 'Testing': return <FiFileText/>;
    case 'Alert': return <FiAlertTriangle/>;
    default: return <FiGitBranch/>;
  }
};

const formatDate = (ts) => ts.split(' ')[0];

export default function Activity(){
  const [items] = useState(seed);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(()=>{
    return items
      .filter(it => filter==='All' || it.type===filter)
      .filter(it => `${it.title} ${it.project} ${it.user}`.toLowerCase().includes(q.toLowerCase()));
  }, [items, filter, q]);

  const grouped = useMemo(()=>{
    return filtered.reduce((acc, it)=>{
      const d = formatDate(it.ts);
      (acc[d] = acc[d] || []).push(it);
      return acc;
    }, {});
  }, [filtered]);

  const dates = useMemo(()=> Object.keys(grouped).sort((a,b)=> a<b?1:-1), [grouped]);

  return (
    <div className="activity">
      <div className="head">
        <div className="title">Activity</div>
        <div className="filters">
          <div className="search">
            <FiSearch/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search activity, users, projects"/>
          </div>
          <div className="select">
            <FiFilter/>
            <select value={filter} onChange={e=>setFilter(e.target.value)}>
              {['All','Project','Task','Approval','Commit','Comment','Testing','Alert'].map(t=> <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="timeline">
          {dates.map(d => (
            <div key={d} className="day">
              <div className="day-head"><FiCalendar/> {d}</div>
              <div className="events">
                {grouped[d].map(ev => (
                  <div key={ev.id} className={`event type-${ev.type.toLowerCase()}`}>
                    <div className="marker">{typeIcon(ev.type)}</div>
                    <div className="content">
                      <div className="row1">
                        <div className="title">{ev.title}</div>
                        <div className="time"><FiClock/> {ev.ts.split(' ')[1]}</div>
                      </div>
                      <div className="row2">
                        <div className="proj">{ev.project}</div>
                        <div className="by"><FiUser/> {ev.user}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {dates.length===0 && (
            <div className="empty">
              <FiClock/>
              <p>No activity found.</p>
            </div>
          )}
        </div>

        <aside className="side">
          <div className="card stats">
            <div className="card-title">This week</div>
            <div className="stat"><span>Approvals</span><b>4</b></div>
            <div className="stat"><span>Commits</span><b>18</b></div>
            <div className="stat"><span>Bugs</span><b>6</b></div>
            <div className="stat"><span>Comments</span><b>12</b></div>
          </div>
          <div className="card legend">
            <div className="card-title">Legend</div>
            <ul>
              <li><span className="dot approval"></span> Approval</li>
              <li><span className="dot task"></span> Task</li>
              <li><span className="dot commit"></span> Commit</li>
              <li><span className="dot comment"></span> Comment</li>
              <li><span className="dot testing"></span> Testing</li>
              <li><span className="dot alert"></span> Alert</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

