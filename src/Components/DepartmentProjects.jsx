import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaTasks, FaUserTie, FaCalendarAlt, FaClock } from 'react-icons/fa';
import './DepartmentProjects.css';

const DepartmentProjects = () => {
  const { department } = useParams();
  const navigate = useNavigate();
  const { getProjectsByDepartment, getProjectsByUser } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'my-tasks', 'active', 'completed'

  // Format date to display as "DD MMM YYYY"
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining until end date
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Overdue';
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'in progress':
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'on-hold':
      case 'on hold':
        return 'status-on-hold';
      default:
        return 'status-planning';
    }
  };

  // Filter projects based on selected filter
  useEffect(() => {
    let filteredProjects = [];

    if (department === 'my-tasks' && user) {
      // Get projects assigned to the current user
      filteredProjects = getProjectsByUser(user.id);
    } else {
      // Get projects by department
      filteredProjects = getProjectsByDepartment(department);
    }

    // Apply additional filters
    if (filter === 'active') {
      filteredProjects = filteredProjects.filter(p => (p.status || '').toLowerCase() === 'in progress' || (p.status || '').toLowerCase() === 'in-progress');
    } else if (filter === 'completed') {
      filteredProjects = filteredProjects.filter(p => (p.status || '').toLowerCase() === 'completed');
    } else if (filter === 'my-tasks' && user) {
      // Already filtered by user's projects
      filteredProjects = filteredProjects.filter(p =>
        p.teamMembers.some(m => m.id === user.id)
      );
    }

    setProjects(filteredProjects);
  }, [department, filter, user, getProjectsByDepartment, getProjectsByUser]);

  return (
    <div className="department-projects">
      <div className="department-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1>
          {department === 'my-tasks' ? 'My Tasks' : `${department} Projects`}
        </h1>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Projects
        </button>

        {department !== 'my-tasks' && (
          <button
            className={`filter-btn ${filter === 'my-tasks' ? 'active' : ''}`}
            onClick={() => setFilter('my-tasks')}
          >
            My Tasks
          </button>
        )}

        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>

        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="no-projects">
          <FaTasks className="no-projects-icon" />
          <h3>No projects found</h3>
          <p>There are no projects in this category.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="project-header">
                <h3>{project.projectName}</h3>
                <span className={`status-badge ${getStatusClass(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>

              <p className="project-client">
                <FaUserTie /> {project.clientName || 'No client specified'}
              </p>

              <div className="project-dates">
                <div className="date">
                  <FaCalendarAlt /> {formatDate(project.startDate)}
                </div>
                <div className="date">
                  <FaCalendarAlt /> {formatDate(project.endDate)}
                </div>
              </div>

              <div className="project-footer">
                <div className="days-remaining">
                  <FaClock /> {getDaysRemaining(project.endDate)}
                </div>

                <div className="team-avatars">
                  {project.teamMembers.slice(0, 3).map((member, index) => (
                    <div key={index} className="avatar" title={`${member.name} (${member.role})`}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  ))}
                  {project.teamMembers.length > 3 && (
                    <div className="avatar more">+{project.teamMembers.length - 3}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentProjects;
