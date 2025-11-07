import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiAlertTriangle, FiClock, FiCheck, FiX, FiUser } from 'react-icons/fi';
import './Bug.css';
import { taskAPI } from '../../services/api';

const Bug = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const res = await taskAPI.getAll({ type: 'bug' });
        setBugs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading] = useState(false);

  // Mock data for bugs
  const bugs = [
    {
      id: 1,
      title: 'Login button not working',
      status: 'open',
      priority: 'high',
      assignedTo: 'John Doe',
      reportedDate: '2023-10-28',
      description: 'The login button does not respond when clicked on mobile devices.'
    },
    // Add more mock bugs here
  ];

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="bug-container">
      <div className="bug-header">
        <h2>Bug Reports</h2>
        <button className="btn-primary">
          <FiPlus size={16} /> Report New Bug
        </button>
      </div>

      <div className="bug-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading bugs...</div>
      ) : filteredBugs.length === 0 ? (
        <div className="no-results">No bugs found matching your criteria.</div>
      ) : (
        <div className="bug-list">
          {filteredBugs.map(bug => (
            <div key={bug.id} className="bug-card">
              <div className="bug-card-header">
                <span className={`bug-status ${bug.status}`}>{bug.status}</span>
                <span className={`bug-priority ${bug.priority}`}>
                  <FiAlertTriangle size={14} /> {bug.priority}
                </span>
              </div>
              <h3>{bug.title}</h3>
              <p className="bug-description">{bug.description}</p>
              <div className="bug-footer">
                <span className="bug-assignee">
                  <FiUser size={14} /> {bug.assignedTo || 'Unassigned'}
                </span>
                <span className="bug-date">
                  <FiClock size={14} /> {bug.reportedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bug;