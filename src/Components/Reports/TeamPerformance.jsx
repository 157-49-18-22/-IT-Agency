import React, { useMemo, useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiSearch, FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './TeamPerformance.css';
import { reportAPI } from '../../services/api';

export default function TeamPerformance() {
  // State hooks at the top
  const [reportData, setReportData] = useState({
    members: [],
    teamVelocity: 0,
    totalHours: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const roles = ['Frontend', 'Backend', 'Mobile', 'QA'];

  // Default data in case API fails
  const defaultMembers = [
    { id: 1, name: 'John Doe', role: 'Frontend', velocity: 25, hours: 32, completed: 12, avgCycle: 2.5 },
    { id: 2, name: 'Jane Smith', role: 'Backend', velocity: 30, hours: 40, completed: 15, avgCycle: 2.0 },
    { id: 3, name: 'Mike Johnson', role: 'Mobile', velocity: 20, hours: 28, completed: 10, avgCycle: 3.0 },
    { id: 4, name: 'Sarah Wilson', role: 'QA', velocity: 15, hours: 25, completed: 8, avgCycle: 1.5 },
  ];

  // Data fetching effect
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching team performance data...');
        const response = await reportAPI.getTeamPerformance();
        console.log('API Response:', response);
        
        // Check if response has data and the data structure we expect
        if (response?.data?.data) {
          const { members = [], teamVelocity = 0, totalHours = 0, completedTasks = 0 } = response.data.data;
          console.log('Extracted data:', { members, teamVelocity, totalHours, completedTasks });
          
          // If no members but we have default members, use them
          if (members.length === 0) {
            console.log('No members in response, using default members');
            setReportData({
              members: defaultMembers,
              teamVelocity: defaultMembers.reduce((sum, m) => sum + (m.velocity || 0), 0),
              totalHours: defaultMembers.reduce((sum, m) => sum + (m.hours || 0), 0),
              completedTasks: defaultMembers.reduce((sum, m) => sum + (m.completed || 0), 0)
            });
          } else {
            setReportData({
              members,
              teamVelocity,
              totalHours,
              completedTasks
            });
          }
        } else {
          console.warn('Unexpected API response structure, using default data');
          // Fallback to default data if response structure is unexpected
          setReportData({
            members: defaultMembers,
            teamVelocity: defaultMembers.reduce((sum, m) => sum + (m.velocity || 0), 0),
            totalHours: defaultMembers.reduce((sum, m) => sum + (m.hours || 0), 0),
            completedTasks: defaultMembers.reduce((sum, m) => sum + (m.completed || 0), 0)
          });
        }
      } catch (error) {
        console.error('Error fetching team performance:', error);
        setError('Failed to load team performance data. Using sample data.');
        // Set default data on error
        setReportData({
          members: defaultMembers,
          teamVelocity: defaultMembers.reduce((sum, m) => sum + (m.velocity || 0), 0),
          totalHours: defaultMembers.reduce((sum, m) => sum + (m.hours || 0), 0),
          completedTasks: defaultMembers.reduce((sum, m) => sum + (m.completed || 0), 0)
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Filtered members
  const filtered = useMemo(() => {
    if (loading) return [];
    
    const members = reportData.members || [];
    
    return members.filter(member => {
      const name = (member.name || '').toLowerCase();
      const memberRole = (member.role || '').toLowerCase();
      const searchTerm = q.toLowerCase();
      const selectedRole = role.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        name.includes(searchTerm) || 
        memberRole.includes(searchTerm);
      
      const matchesRole = selectedRole === 'all' || 
        memberRole.toLowerCase() === selectedRole.toLowerCase();
      
      return matchesSearch && matchesRole;
    });
  }, [q, role, loading, reportData.members]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading team performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FiAlertCircle className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

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
          <div className="kpi-title"><FiTrendingUp className="kpi-icon" /> Team Velocity</div>
          <div className="kpi-value">
            {filtered.length > 0 
              ? filtered.reduce((sum, m) => sum + (m.velocity || 0), 0) 
              : reportData.teamVelocity || 0} pts
          </div>
          <div className="kpi-sub">This sprint</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title"><FiClock className="kpi-icon" /> Logged Hours</div>
          <div className="kpi-value">
            {filtered.length > 0 
              ? filtered.reduce((sum, m) => sum + (m.hours || 0), 0) 
              : reportData.totalHours || 0} h
          </div>
          <div className="kpi-sub">Week to date</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title"><FiCheckCircle className="kpi-icon" /> Completed</div>
          <div className="kpi-value">
            {filtered.length > 0 
              ? filtered.reduce((sum, m) => sum + (m.completed || 0), 0) 
              : reportData.completedTasks || 0}
          </div>
          <div className="kpi-sub">Tasks</div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="member-list">
          {filtered.map(member => (
            <div className="member-card" key={member.id || member._id || Math.random().toString(36).substr(2, 9)}>
              <div className="head">
                <div className="avatar">{(member.name || '').charAt(0).toUpperCase()}</div>
                <div className="info">
                  <div className="name">{member.name || 'Unnamed Member'}</div>
                  <div className="role">{member.role || 'No Role'}</div>
                </div>
              </div>
              <div className="row">
                <span>Velocity</span>
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{
                      width: `${Math.min(100, (member.velocity || 0) * 2)}%`,
                      backgroundColor: member.velocity > 25 ? '#4CAF50' : member.velocity > 15 ? '#FFC107' : '#F44336'
                    }}
                  />
                </div>
                <span className="mono">{member.velocity || 0} pts</span>
              </div>
              <div className="row">
                <span>Hours</span>
                <div className="bar">
                  <div 
                    className="fill blue" 
                    style={{
                      width: `${Math.min(100, ((member.hours || 0) / 40) * 100)}%`,
                      backgroundColor: member.hours > 35 ? '#2196F3' : member.hours > 20 ? '#00BCD4' : '#9E9E9E'
                    }}
                  />
                </div>
                <span className="mono">{member.hours || 0} h</span>
              </div>
              <div className="row">
                <span>Completed</span>
                <div className="bar">
                  <div 
                    className="fill green" 
                    style={{
                      width: `${Math.min(100, ((member.completed || 0) / 15) * 100)}%`,
                      backgroundColor: member.completed > 10 ? '#4CAF50' : member.completed > 5 ? '#8BC34A' : '#CDDC39'
                    }}
                  />
                </div>
                <span className="mono">{member.completed || 0}</span>
              </div>
              <div className="row last">
                <span>Avg Cycle</span>
                <span className="chip" style={{
                  backgroundColor: (member.avgCycle || 0) < 2 ? '#E8F5E9' : 
                                 (member.avgCycle || 0) < 4 ? '#FFF8E1' : '#FFEBEE',
                  color: (member.avgCycle || 0) < 2 ? '#2E7D32' : 
                         (member.avgCycle || 0) < 4 ? '#F57F17' : '#C62828'
                }}>
                  {member.avgCycle || 0} days
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No team members found matching your criteria.</p>
          <button 
            className="reset-filters" 
            onClick={() => {
              setQ('');
              setRole('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

