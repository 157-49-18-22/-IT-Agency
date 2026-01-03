import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaClipboardCheck,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { projectStagesAPI, stageTransitionsAPI, projectsAPI } from '../../services/api';
import './StageTransition.css';

const StageTransition = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [nextStage, setNextStage] = useState(null);
  const [canTransition, setCanTransition] = useState(false);
  const [transitionChecklist, setTransitionChecklist] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchStageData();
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getProjects();
      const list = response.data?.data || response.data || [];
      setProjectsList(list);
    } catch (err) {
      console.error('Error fetching projects list:', err);
    }
  };

  const fetchStageData = async () => {
    try {
      setLoading(true);

      const [stagesRes, canTransRes] = await Promise.all([
        projectStagesAPI.getStages(projectId),
        stageTransitionsAPI.canTransition(projectId)
      ]);

      const stagesData = stagesRes.data?.data || [];
      setStages(stagesData);

      // Find current and next stage
      const current = stagesData.find(s => s.status === 'in_progress');
      const currentIndex = stagesData.findIndex(s => s.id === current?.id);
      const next = currentIndex >= 0 && currentIndex < stagesData.length - 1
        ? stagesData[currentIndex + 1]
        : null;

      setCurrentStage(current);
      setNextStage(next);
      setCanTransition(canTransRes.data?.canTransition || false);
      setTransitionChecklist(canTransRes.data?.checklist || []);

      // Also set current project details if available
      const projectDetails = projectsList.find(p => String(p.id) === String(projectId));
      if (projectDetails) setProject(projectDetails);
      else {
        // Fetch specific project if not in list
        try {
          const pRes = await projectsAPI.getProject(projectId);
          setProject(pRes.data?.data || pRes.data);
        } catch (e) { }
      }

    } catch (error) {
      console.log('Using mock data for Stage Transition preview');

      // MOCK DATA FALLBACK
      const mockStages = [
        { id: 1, stageName: 'UI/UX Design', status: 'completed', progressPercentage: 100, startDate: '2025-01-01', endDate: '2025-01-15' },
        { id: 2, stageName: 'Development', status: 'in_progress', progressPercentage: 45, startDate: '2025-01-16', endDate: '2025-02-15' },
        { id: 3, stageName: 'Testing', status: 'not_started', progressPercentage: 0, startDate: null, endDate: null },
        { id: 4, stageName: 'Deployment', status: 'not_started', progressPercentage: 0, startDate: null, endDate: null }
      ];

      setStages(mockStages);
      setCurrentStage(mockStages[1]); // Development
      setNextStage(mockStages[2]); // Testing
      setCanTransition(true);
      setTransitionChecklist([
        { description: 'All critical bugs resolved', completed: true },
        { description: 'Code review completed', completed: true },
        { description: 'Unit tests passed', completed: false, reason: 'Coverage below 80%' },
        { description: 'Documentation updated', completed: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      navigate(`/stage-transition/${newId}`);
    }
  };

  const handleTransition = async () => {
    if (!canTransition) return;

    try {
      setTransitioning(true);
      await stageTransitionsAPI.transitionStage(projectId, {
        fromStageId: currentStage.id,
        toStageId: nextStage.id,
        toStage: nextStage.stageName,
        notes: transitionNotes
      });

      // Success - refresh data
      await fetchStageData();
      setShowConfirmModal(false);
      setTransitionNotes('');

      // Show success message
      alert('Stage transition successful!');
    } catch (error) {
      console.error('Error transitioning stage:', error);
      alert('Failed to transition stage. Please try again.');
    } finally {
      setTransitioning(false);
    }
  };

  const getStageIcon = (stageName) => {
    if (stageName.includes('UI/UX')) return '🎨';
    if (stageName.includes('Development')) return '💻';
    if (stageName.includes('Testing')) return '🧪';
    return '✅';
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return '#2ecc71';
      case 'in_progress': return '#3498db';
      case 'not_started': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  if (loading && projectId) {
    return (
      <div className="stage-transition-loading">
        <FaSpinner className="spinner" />
        <p>Loading stage information...</p>
      </div>
    );
  }

  return (
    <div className="stage-transition-container">
      {/* Header */}
      <div className="stage-transition-header">
        <div className="header-top">
          <div>
            <h1>Stage Transition Management</h1>
            <p>Manage project progression through different stages</p>
          </div>
          <div className="project-selector">
            <label>Select Project:</label>
            <select value={projectId || ''} onChange={handleProjectChange}>
              <option value="">Select a project...</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!projectId && !loading && (
        <div className="no-project-selected">
          <FaExclamationTriangle size={40} color="#f39c12" />
          <h3>No Project Selected</h3>
          <p>Please select a project from the dropdown to manage its stage transitions.</p>
        </div>
      )}

      {projectId && (
        <div className="current-stage-section">
          <h2>Current Stage: {currentStage.stageName}</h2>

          <div className="stage-details-grid">
            <div className="detail-card">
              <label>Status</label>
              <span className={`status-badge ${currentStage.status}`}>
                {currentStage.status.replace('_', ' ')}
              </span>
            </div>
            <div className="detail-card">
              <label>Progress</label>
              <span className="detail-value">{currentStage.progressPercentage || 0}%</span>
            </div>
            <div className="detail-card">
              <label>Start Date</label>
              <span className="detail-value">
                {currentStage.startDate ? new Date(currentStage.startDate).toLocaleDateString() : 'Not started'}
              </span>
            </div>
            <div className="detail-card">
              <label>Expected End</label>
              <span className="detail-value">
                {currentStage.endDate ? new Date(currentStage.endDate).toLocaleDateString() : 'Not set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transition Checklist */}
      {nextStage && (
        <div className="transition-section">
          <h2>Transition to {nextStage.stageName}</h2>

          <div className="transition-checklist">
            <h3>
              <FaClipboardCheck /> Transition Requirements
            </h3>
            <div className="checklist-items">
              {transitionChecklist.map((item, index) => (
                <div key={index} className={`checklist-item ${item.completed ? 'completed' : 'pending'}`}>
                  {item.completed ? (
                    <FaCheckCircle className="check-icon completed" />
                  ) : (
                    <FaExclamationTriangle className="check-icon pending" />
                  )}
                  <span className="checklist-text">{item.description}</span>
                  {!item.completed && item.reason && (
                    <span className="checklist-reason">{item.reason}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canTransition ? (
            <div className="transition-actions">
              <button
                className="btn-transition"
                onClick={() => setShowConfirmModal(true)}
              >
                <FaArrowRight /> Transition to {nextStage.stageName}
              </button>
            </div>
          ) : (
            <div className="transition-blocked">
              <FaExclamationTriangle />
              <p>Complete all requirements before transitioning to the next stage</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Stage Transition</h3>
              <button
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <p>
                You are about to transition this project from
                <strong> {currentStage?.stageName}</strong> to
                <strong> {nextStage?.stageName}</strong>.
              </p>

              <div className="transition-notes">
                <label>Transition Notes (Optional)</label>
                <textarea
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Add any notes about this transition..."
                  rows="4"
                />
              </div>

              <div className="modal-warning">
                <FaExclamationTriangle />
                <p>This action will notify the next team and cannot be easily undone.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={transitioning}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleTransition}
                disabled={transitioning}
              >
                {transitioning ? (
                  <>
                    <FaSpinner className="spinner" /> Transitioning...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Confirm Transition
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageTransition;
