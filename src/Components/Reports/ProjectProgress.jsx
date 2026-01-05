import React, { useMemo, useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiSearch, FiFlag, FiUsers, FiCalendar } from 'react-icons/fi';
import './ProjectProgress.css';
import { projectAPI } from '../../services/api';
import { format } from 'date-fns';

// Helper function to calculate project status based on progress and due date
const getProjectStatus = (project) => {
  const today = new Date();
  const dueDate = new Date(project.endDate);
  const timeDiff = dueDate - today;
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Determine status based on progress and due date
  let status = 'On Track';
  if (progress < 50 && daysRemaining < 7) {
    status = 'At Risk';
  } else if (progress < 30 && daysRemaining < 14) {
    status = 'Delayed';
  } else if (daysRemaining < 0) {
    status = 'Overdue';
  }
  
  return { progress, status };
};

export default function ProjectProgress() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  
  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log('Fetching projects...');
        const response = await projectAPI.getAll();
        console.log('API Response:', response);
        
        if (!response || !response.data) {
          console.error('No data in response');
          return;
        }
        
        // Check if data is an array, if not, try to get the array from a property
        const projectsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.projects || response.data.data || [];
        
        // Process projects to include calculated fields
        const processedProjects = projectsData.map(project => {
          const { progress, status } = getProjectStatus(project);
          return {
            id: project.id,
            name: project.name,
            manager: project.projectManager?.name || 'Unassigned',
            endDate: project.endDate,
            due: project.endDate, // Keep both for backward compatibility
            status,
            progress,
            team: project.teamMembers?.length || 0,
            milestones: project.milestones || [],
            tasks: project.tasks || []
          };
        });
        
        setProjects(processedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Filtered projects
  const filtered = useMemo(() => {
    if (loading) return [];
    return projects.filter(p => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q.toLowerCase()) || 
                          p.manager.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = status === 'all' || p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [q, status, loading, projects]);

  if (loading) return <div className="loading">Loading projects...</div>;
  
  console.log('Projects:', projects);
  console.log('Filtered projects:', filtered);
  
  if (!projects.length) {
    return <div className="no-data">No projects found. Create a project to get started.</div>;
  }

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
              <div className="m"><FiCalendar/> Due {format(new Date(p.due), 'MMM dd, yyyy')}</div>
            </div>
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="pct">{p.progress}%</span>
              </div>
              <div className="bar-container">
                <div className="bar">
                  <div className="fill" style={{ width: `${p.progress}%` }}>
                    <div className="glimmer"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="timeline">
              {p.milestones && p.milestones.length > 0 ? (
                p.milestones.map((milestone, i) => (
                  <div key={i} className="milestone">
                    <div className="dot" />
                    <div className="ml-body">
                      <div className="ml-title">{milestone.title || `Milestone ${i + 1}`}</div>
                      <div className="ml-date">
                        {milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM dd, yyyy') : 'No date'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-milestones">No milestones defined</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

