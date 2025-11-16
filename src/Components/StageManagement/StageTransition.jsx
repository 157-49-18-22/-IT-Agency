import React, { useState, useEffect, useContext } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import './StageTransition.css';
import { useAuth } from '../../context/AuthContext';
import { 
  getStageTransitionsByProject, 
  createStageTransition
} from '../../services/stageTransitionService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const STAGES = {
  1: { name: 'UI/UX Design', next: 'Development' },
  2: { name: 'Development', next: 'Testing' },
  3: { name: 'Testing', next: 'Deployment' },
  4: { name: 'Deployment', next: 'Completed' }
};

export default function StageTransition({ projectId }) {
  const { currentUser: user } = useAuth();
  const token = user?.token;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjectAndTransitions = React.useCallback(async () => {
    // Ensure projectId is a number
    const numericProjectId = Number(projectId);
    console.log('fetchProjectAndTransitions called with projectId:', numericProjectId, 'Type:', typeof numericProjectId, 'token exists:', !!token);
    
    if (!numericProjectId || isNaN(numericProjectId) || !token) {
      const errorMsg = !projectId ? 'Project ID is missing' : 
                       isNaN(numericProjectId) ? 'Invalid project ID format' : 'Authentication token is missing';
      console.error('Missing required data:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project data
      console.log('1. Fetching project data for ID:', projectId);
      const projectResponse = await projectAPI.getById(projectId);
      console.log('2. Project API response:', projectResponse);
      
      if (!projectResponse) {
        throw new Error('No project data received from API');
      }
      
      const projectData = projectResponse;
      console.log('3. Project data to be used:', projectData);
      
      // Fetch stage transitions for this project
      console.log('4. Fetching stage transitions for project ID:', projectId);
      let transitionsResponse;
      try {
        console.log('4.1. Calling getStageTransitionsByProject with:', { 
        projectId: numericProjectId, 
        token: token ? 'token exists' : 'no token' 
      });
      transitionsResponse = await getStageTransitionsByProject(numericProjectId, token);
        console.log('5. Transitions API response:', {
          status: transitionsResponse?.status,
          statusText: transitionsResponse?.statusText,
          data: transitionsResponse?.data ? 'Data received' : 'No data',
          dataLength: transitionsResponse?.data?.length || 0
        });
        
        if (transitionsResponse?.data) {
          console.log('5.1. First transition item (if any):', transitionsResponse.data[0]);
        }
      } catch (transitionsError) {
        console.error('Error fetching transitions:', {
          message: transitionsError.message,
          response: {
            status: transitionsError.response?.status,
            data: transitionsError.response?.data
          },
          stack: transitionsError.stack
        });
        // Continue even if transitions fail
        transitionsResponse = { data: [] };
      }
      
      // Map the project data to match the expected format
      const mappedProject = {
        id: projectData._id || projectId,
        name: projectData.name || 'Unnamed Project',
        currentStage: projectData.currentStage || 0,
        stageName: STAGES[projectData.currentStage]?.name || 'Not Started',
        nextStage: projectData.nextStage || 1,
        progress: projectData.progress || 0,
        readyForTransition: projectData.readyForTransition || false,
        estimatedStartDate: projectData.estimatedStartDate || new Date().toLocaleDateString(),
        checklist: projectData.checklist || [
          { id: 1, item: 'Initial setup', completed: true },
          { id: 2, item: 'Requirements gathering', completed: false },
          { id: 3, item: 'Design phase', completed: false },
          { id: 4, item: 'Development', completed: false },
          { id: 5, item: 'Testing', completed: false },
          { id: 6, item: 'Deployment', completed: false }
        ]
      };
      
      console.log('6. Mapped project data:', mappedProject);
      setProject(mappedProject);
      setTransitions(transitionsResponse.data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load project data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId, token, user?.id]);

  useEffect(() => {
    fetchProjectAndTransitions();
  }, [fetchProjectAndTransitions]);

  const handleTransition = async (projectId) => {
    if (!token) {
      toast.error('Authentication required. Please log in.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create a new stage transition
      const transitionData = {
        projectId,
        fromStage: project.currentStage,
        toStage: project.currentStage + 1,
        notes: transitionNotes,
        requestedById: user.id,
        status: 'pending' // pending, approved, rejected
      };

      const response = await createStageTransition(transitionData, token);
      
      // Update local state
      setTransitions([response.data, ...transitions]);
      
      // Update project stage (in a real app, this would come from the server)
      setProject(prev => ({
        ...prev,
        currentStage: response.data.toStage,
        stageName: STAGES[response.data.toStage]?.name || `Stage ${response.data.toStage}`,
        nextStage: STAGES[response.data.toStage]?.next || 'Completed',
        progress: 0, // Reset progress for new stage
        readyForTransition: false,
        checklist: getNextStageChecklist(response.data.toStage)
      }));
      
      setSelectedProject(null);
      setTransitionNotes('');
      
      toast.success('Stage transition request submitted successfully!');
      
    } catch (error) {
      console.error('Error creating stage transition:', error);
      toast.error(error.response?.data?.message || 'Failed to submit transition request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransitionClick = (project) => {
    // Check if all checklist items are completed
    const allCompleted = project.checklist.every(item => item.completed);
    if (!allCompleted) {
      toast.warning('Please complete all checklist items before transitioning');
      return;
    }
    
    // Set the selected project to show the modal
    setSelectedProject(project);
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
      ],
      4: [ // Deployment
        { id: 1, item: 'Deployment plan created', completed: false },
        { id: 2, item: 'Database migration scripts ready', completed: false },
        { id: 3, item: 'Backup completed', completed: false },
        { id: 4, item: 'Deployment to production', completed: false },
        { id: 5, item: 'Post-deployment testing', completed: false }
      ]
    };
    return checklists[stage] || [];
  };

  const toggleChecklistItem = async (itemId) => {
    if (!project) return;
    
    try {
      const updatedChecklist = project.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      const allCompleted = updatedChecklist.every(item => item.completed);
      
      // In a real app, you would save this to the backend
      // await updateProjectChecklist(project.id, updatedChecklist, token);
      
      setProject(prev => ({
        ...prev,
        checklist: updatedChecklist,
        readyForTransition: allCompleted
      }));
      
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Failed to update checklist');
    }
  };


  // Calculate progress percentage based on completed checklist items
  const progressPercentage = project && project.checklist && project.checklist.length > 0
    ? Math.round((project.checklist.filter(item => item.completed).length / project.checklist.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="stage-transition">
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
          <p>Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stage-transition">
        <div className="error-container">
          <FiAlertCircle className="error-icon" />
          <p>Error loading project: {error}</p>
          <button className="retry-button" onClick={fetchProjectAndTransitions}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="stage-transition">
        <div className="empty-state">
          <FiAlertCircle size={48} />
          <h3>Project not found</h3>
          <p>The requested project could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-transition">
      <div className="st-header">
        <div>
          <h1>Stage Transition: {project?.name || 'Project'}</h1>
          <p>Manage project stage transitions with completion checklists</p>
        </div>
        {project?.currentStage && (
          <div className="current-stage-badge">
            <span>Current Stage: </span>
            <strong style={{ color: getStageColor(project.currentStage) }}>
              {project.stageName || 'Not Set'}
            </strong>
          </div>
        )}
      </div>

      <div className="project-card">
        <div className="project-header">
          <div>
            <h3>{project.name}</h3>
            <div className="current-stage" style={{ color: getStageColor(project.currentStage) }}>
              Stage {project.currentStage}: {project.stageName}
            </div>
          </div>
          <div className={`ready-badge ${project.readyForTransition ? 'ready' : 'not-ready'}`}>
            {project.readyForTransition ? (
              <><FiCheckCircle /> Ready for Transition</>
            ) : (
              <><FiClock /> In Progress</>
            )}
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>Stage Progress</span>
            <span className="progress-percent">{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progressPercentage}%`,
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
                  onChange={() => toggleChecklistItem(item.id)}
                  disabled={isSubmitting}
                />
                <span className={item.completed ? 'completed' : ''}>{item.item}</span>
                {item.completed && <FiCheck className="check-icon" />}
              </label>
            ))}
          </div>
        </div>

        {project.currentStage < 4 ? (
          <div className="transition-section">
            <div className="next-stage-info">
              <FiArrowRight />
              <span>Next Stage: <strong>{project.nextStage}</strong></span>
              <span className="start-date">Est. Start: {project.estimatedStartDate}</span>
            </div>
            <button
              className={`transition-btn ${project.readyForTransition ? 'ready' : 'disabled'}`}
              onClick={() => handleTransitionClick(project)}
              disabled={!project.readyForTransition || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="loading-spinner" />
                  Processing...
                </>
              ) : project.readyForTransition ? (
                'Transition to Next Stage'
              ) : (
                'Complete Checklist First'
              )}
            </button>
          </div>
        ) : (
          <div className="completion-section">
            <FiCheckCircle className="complete-icon" />
            <span>Project Ready for Completion</span>
          </div>
        )}

      </div>
      
      {/* Transition History */}
      {transitions.length > 0 && (
        <div className="transitions-history">
          <h3>Transition History</h3>
          <div className="transitions-list">
            {transitions.map((transition, index) => (
              <div key={index} className="transition-item">
                <div className="transition-header">
                  <span className="transition-stage">
                    Stage {transition.fromStage} → Stage {transition.toStage}
                  </span>
                  <span className={`status-badge ${transition.status}`}>
                    {transition.status.charAt(0).toUpperCase() + transition.status.slice(1)}
                  </span>
                </div>
                <div className="transition-details">
                  <span className="transition-date">
                    {new Date(transition.transitionDate).toLocaleString()}
                  </span>
                  {transition.notes && (
                    <p className="transition-notes">{transition.notes}</p>
                  )}
                  {transition.status === 'rejected' && transition.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>Reason: </strong>
                      {transition.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transition Confirmation Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Stage Transition</h2>
              <button 
                className="modal-close" 
                onClick={() => !isSubmitting && setSelectedProject(null)}
                disabled={isSubmitting}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {isSubmitting ? (
                <div className="loading-container">
                  <FiLoader className="loading-spinner" />
                  <p>Processing your request...</p>
                </div>
              ) : (
                <>
                  <div className="transition-summary">
                    <div className="summary-item">
                      <span className="label">Project:</span>
                      <span className="value">{selectedProject.name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Current Stage:</span>
                      <span className="value">{selectedProject.stageName} (Stage {selectedProject.currentStage})</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Next Stage:</span>
                      <span className="value">{selectedProject.nextStage} (Stage {selectedProject.currentStage + 1})</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Estimated Start:</span>
                      <span className="value">{selectedProject.estimatedStartDate}</span>
                    </div>
                  </div>

                  <div className="checklist-review">
                    <h3>Completion Checklist</h3>
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
                    <label>Transition Notes (Required)</label>
                    <textarea
                      value={transitionNotes}
                      onChange={e => setTransitionNotes(e.target.value)}
                      placeholder="Provide details about what has been completed in this stage and any important information for the next stage..."
                      rows="4"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {!isSubmitting && (
                    <div className="modal-footer">
                      <button 
                        className="btn-cancel" 
                        onClick={() => setSelectedProject(null)}
                        disabled={isSubmitting}
                        type="button"
                      >
                        <FiX /> Cancel
                      </button>
                      <button 
                        className="btn-confirm" 
                        onClick={() => handleTransition(selectedProject.id)}
                        disabled={!transitionNotes.trim() || isSubmitting}
                        type="button"
                      >
                        <FiCheck /> Confirm Transition
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
