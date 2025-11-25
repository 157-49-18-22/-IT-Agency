import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaCalendarAlt, FaUserTie, FaUsers, FaFileAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { ProjectContext } from '../context/ProjectContext';
import { teamAPI } from '../services/api';
import './NewProjects.css';

const NewProjects = () => {
  const navigate = useNavigate();
  const { addProject } = useContext(ProjectContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    projectType: 'web',
    startDate: '',
    endDate: '',
    budget: '',
    teamMembers: [],
    description: '',
    status: 'planning',
    priority: 'medium',
    attachments: []
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamAPI.getAll();
        if (response.data && response.data.data && response.data.data.members) {
          setTeamMembers(response.data.data.members);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const toggleTeamMember = (memberId) => {
    setFormData(prev => {
      const updatedMembers = [...prev.teamMembers];
      const index = updatedMembers.findIndex(id => id === memberId);
      
      if (index === -1) {
        updatedMembers.push(memberId);
      } else {
        updatedMembers.splice(index, 1);
      }
      
      return {
        ...prev,
        teamMembers: updatedMembers
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get full member details including their departments
      const selectedMembers = formData.teamMembers.map(id => {
        const member = teamMembers.find(m => m.id === id);
        if (!member) return null;
        
        // Ensure department is set, default to 'Development' if not specified
        const department = member.department || 'Development';
        
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          department: department,
          status: member.status || 'active'
        };
      }).filter(Boolean); // Remove any undefined members
      
      // Create the new project with team members and their departments
      const newProject = {
        ...formData,
        teamMembers: selectedMembers,
        // Extract unique departments from team members
        departments: [...new Set(selectedMembers.map(member => member.department))]
      };
      
      addProject(newProject);
      
      // Show success state
      setSubmitSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
  };

  return (
    <div className="new-project-container">
      <div className="project-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1>Create New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="form-group">
              <label>Client Name *</label>
              <div className="input-with-icon">
                <FaUserTie className="input-icon" />
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Project Type *</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                required
              >
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="design">UI/UX Design</option>
                <option value="marketing">Digital Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter project budget"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Timeline</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Start Date *</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Team Members</h2>
          {loading ? (
            <div className="loading">Loading team members...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : teamMembers.length === 0 ? (
            <div className="no-members">No team members found. Please add team members first.</div>
          ) : (
            <div className="team-members-grid">
              {teamMembers.map(member => (
                <div 
                  key={member.id} 
                  className={`team-member-card ${formData.teamMembers.includes(member.id) ? 'selected' : ''}`}
                  onClick={() => toggleTeamMember(member.id)}
                >
                  <div className="member-avatar">
                    {member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <div className="member-details">
                    <h4>{member.name || 'Unnamed User'}</h4>
                    <p>{member.role || 'Team Member'}</p>
                  </div>
                  {formData.teamMembers.includes(member.id) && (
                    <div className="member-selected">
                      <FaCheck />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Project Description</h2>
          <div className="form-group">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project in detail..."
              rows={5}
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h2>Attachments</h2>
          <div className="file-upload-container">
            <label className="file-upload-button">
              <FaUpload className="upload-icon" />
              <span>Upload Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <p className="file-upload-hint">Upload project documents, images, or other files (Max 10MB)</p>
            
            {formData.attachments.length > 0 && (
              <div className="attachments-list">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <FaFileAlt className="file-icon" />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate('/projects')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`submit-button ${submitSuccess ? 'success' : ''}`}
            disabled={isSubmitting || submitSuccess}
          >
            {submitSuccess ? (
              <>
                <FaCheck /> Success!
              </>
            ) : isSubmitting ? (
              'Creating...'
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjects;