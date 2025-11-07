import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import './StageTransition.css';
import { projectAPI } from '../../services/api';

export default function StageTransition() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectAPI.getAll();
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const [selectedProject, setSelectedProject] = useState(null);
  const [transitionNotes, setTransitionNotes] = useState('');

  if (loading) return <div className="loading">Loading...</div>;

  const handleTransition = async (projectId, newStage) => {
    try {
      await projectAPI.updatePhase(projectId, newStage);
      const response = await projectAPI.getAll();
      setProjects(response.data || []);
    } catch (error) {
      alert('Error transitioning stage');
    }
  };

  const handleTransitionClick = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    
    if (!project.readyForTransition) {
      alert('Please complete all checklist items before transitioning');
      return;
    }

    if (!transitionNotes.trim()) {
      alert('Please provide transition notes');
      return;
    }

    // Update project stage
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            currentStage: p.currentStage + 1,
            stageName: p.nextStage,
            progress: 0,
            readyForTransition: false,
            checklist: getNextStageChecklist(p.currentStage + 1)
          }
        : p
    ));

    setSelectedProject(null);
    setTransitionNotes('');
    alert(`Project transitioned to ${project.nextStage} stage successfully!`);
  };

  const getNextStageChecklist = (stage) => {
    const checklists = {
      2: [ // Development
        { id: 1, item: 'Frontend development complete', completed: false },
        { id: 2, item: 'Backend APIs implemented', completed: false },
        { id: 3, item: 'Database schema finalized', completed: false },
        { id: 4, item: 'Code review completed', completed: false },
        { id: 5, item: 'Documentation updated', completed: false }
      ],
      3: [ // Testing
        { id: 1, item: 'Test plan created', completed: false },
        { id: 2, item: 'All test cases executed', completed: false },
        { id: 3, item: 'Bugs resolved', completed: false },
        { id: 4, item: 'UAT completed', completed: false },
        { id: 5, item: 'Performance testing done', completed: false }
      ]
    };
    return checklists[stage] || [];
  };

  const toggleChecklistItem = (projectId, itemId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedChecklist = p.checklist.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const allCompleted = updatedChecklist.every(item => item.completed);
        return { ...p, checklist: updatedChecklist, readyForTransition: allCompleted };
      }
      return p;
    }));
  };

  const getStageColor = (stage) => {
    const colors = {
      1: '#8b5cf6', // UI/UX - Purple
      2: '#3b82f6', // Development - Blue
      3: '#10b981'  // Testing - Green
    };
    return colors[stage] || '#6b7280';
  };

  return (
    <div className="stage-transition">
      <div className="st-header">
        <div>
          <h1>Stage Transition Management</h1>
          <p>Manage project stage transitions with completion checklists</p>
        </div>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div>
                <h3>{project.name}</h3>
                <div className="current-stage" style={{ color: getStageColor(project.currentStage) }}>
                  Stage {project.currentStage}: {project.stageName}
                </div>
              </div>
              <div className={`ready-badge ${project.readyForTransition ? 'ready' : 'not-ready'}`}>
                {project.readyForTransition ? (
                  <><FiCheckCircle /> Ready</>
                ) : (
                  <><FiClock /> In Progress</>
                )}
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Stage Progress</span>
                <span className="progress-percent">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${project.progress}%`,
                    background: getStageColor(project.currentStage)
                  }}
                ></div>
              </div>
            </div>

            <div className="checklist-section">
              <h4>Completion Checklist</h4>
              <div className="checklist">
                {project.checklist.map(item => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(project.id, item.id)}
                    />
                    <span className={item.completed ? 'completed' : ''}>{item.item}</span>
                    {item.completed && <FiCheck className="check-icon" />}
                  </label>
                ))}
              </div>
            </div>

            {project.currentStage < 3 && (
              <div className="transition-section">
                <div className="next-stage-info">
                  <FiArrowRight />
                  <span>Next Stage: <strong>{project.nextStage}</strong></span>
                  <span className="start-date">Est. Start: {project.estimatedStartDate}</span>
                </div>
                <button
                  className={`transition-btn ${project.readyForTransition ? 'ready' : 'disabled'}`}
                  onClick={() => setSelectedProject(project)}
                  disabled={!project.readyForTransition}
                >
                  {project.readyForTransition ? 'Transition to Next Stage' : 'Complete Checklist First'}
                </button>
              </div>
            )}

            {project.currentStage === 3 && project.readyForTransition && (
              <div className="completion-section">
                <FiCheckCircle className="complete-icon" />
                <span>Project Ready for Completion</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transition Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Stage Transition</h2>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="transition-summary">
                <div className="summary-item">
                  <span className="label">Project:</span>
                  <span className="value">{selectedProject.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Current Stage:</span>
                  <span className="value">{selectedProject.stageName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Next Stage:</span>
                  <span className="value">{selectedProject.nextStage}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Estimated Start:</span>
                  <span className="value">{selectedProject.estimatedStartDate}</span>
                </div>
              </div>

              <div className="checklist-review">
                <h3>Completed Items:</h3>
                <ul>
                  {selectedProject.checklist.map(item => (
                    <li key={item.id} className={item.completed ? 'done' : 'pending'}>
                      {item.completed ? <FiCheckCircle /> : <FiAlertCircle />}
                      {item.item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="notes-section">
                <label>Transition Notes (Required):</label>
                <textarea
                  value={transitionNotes}
                  onChange={e => setTransitionNotes(e.target.value)}
                  placeholder="Provide notes about the stage completion and handover details..."
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedProject(null)}>
                <FiX /> Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => handleTransition(selectedProject.id)}
              >
                <FiCheck /> Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
