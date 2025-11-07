import React, { useMemo, useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiSearch, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import './TeamPerformance.css';
import { reportAPI } from '../../services/api';

export default function TeamPerformance() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await reportAPI.getTeamPerformance();
        setReportData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');

  const roles = ['Frontend','Backend','Mobile','QA'];
  const filtered = useMemo(() => members.filter(m => {
    const okQ = !q || m.name.toLowerCase().includes(q.toLowerCase());
    const okR = role === 'all' || m.role === role;
    return okQ && okR;
  }), [q, role]);

  return (
    <div className="tp-container">
      <div className="tp-header">
        <div>
          <h2>Team Performance</h2>
          <p>Measure velocity, workload, cycle time and throughput across the team.</p>
        </div>
        <div className="filters">
          <div className="search">
            <FiSearch className="icon" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search members..." />
          </div>
          <div className="select">
            <FiFilter className="icon" />
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option value="all">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <FiChevronDown className="chev" />
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title"><FiTrendingUp/> Team Velocity</div>
          <div className="kpi-value">{members.reduce((s,m)=>s+m.velocity,0)} pts</div>
          <div className="kpi-sub">This sprint</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title"><FiClock/> Logged Hours</div>
          <div className="kpi-value">{members.reduce((s,m)=>s+m.hours,0)} h</div>
          <div className="kpi-sub">Week to date</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title"><FiCheckCircle/> Completed</div>
          <div className="kpi-value">{members.reduce((s,m)=>s+m.completed,0)}</div>
          <div className="kpi-sub">Tasks</div>
        </div>
      </div>

      <div className="member-list">
        {filtered.map(m => (
          <div className="member-card" key={m.id}>
            <div className="head">
              <div className="avatar">{m.name.charAt(0)}</div>
              <div className="info">
                <div className="name">{m.name}</div>
                <div className="role">{m.role}</div>
              </div>
            </div>
            <div className="row">
              <span>Velocity</span>
              <div className="bar"><div className="fill" style={{width:`${m.velocity}%`}}/></div>
              <span className="mono">{m.velocity} pts</span>
            </div>
            <div className="row">
              <span>Hours</span>
              <div className="bar"><div className="fill blue" style={{width:`${Math.min(100, (m.hours/45)*100)}%`}}/></div>
              <span className="mono">{m.hours} h</span>
            </div>
            <div className="row">
              <span>Completed</span>
              <div className="bar"><div className="fill green" style={{width:`${Math.min(100, (m.completed/30)*100)}%`}}/></div>
              <span className="mono">{m.completed}</span>
            </div>
            <div className="row last">
              <span>Avg Cycle</span>
              <span className="chip">{m.avgCycle} days</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

