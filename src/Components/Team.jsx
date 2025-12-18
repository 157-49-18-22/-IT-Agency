import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiFilter, FiPlus, FiMail, FiPhone, FiUser,
  FiEdit2, FiTrash2, FiChevronDown, FiEye, FiEyeOff,
  FiCheckSquare, FiClock, FiCalendar, FiType, FiBookmark
} from 'react-icons/fi';
import './Team.css';
import { userAPI, teamAPI } from '../services/api';
import { createTask } from '../services/taskService';

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [departments, setDepartments] = useState([
    { id: 1, name: 'UI/UX', count: 0 },
    { id: 2, name: 'Development', count: 0 },
    { id: 3, name: 'Tester', count: 0 }
  ]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    phone: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: ''
  });

  const updateDepartmentCounts = (membersList) => {
    const counts = { ...departments.reduce((acc, dept) => ({ ...acc, [dept.name]: 0 }), {}) };

    membersList.forEach(member => {
      if (member.department && counts.hasOwnProperty(member.department)) {
        counts[member.department]++;
      }
    });

    setDepartments(prevDepartments =>
      prevDepartments.map(dept => ({
        ...dept,
        count: counts[dept.name] || 0
      }))
    );
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getAll();
      const membersData = response.data?.data?.members || [];

      setMembers(membersData);
      setFilteredMembers(membersData);

      // Update department counts
      updateDepartmentCounts(membersData);

    } catch (error) {
      console.error('Error fetching team:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await teamAPI.removeMember(id);
        // Update the members list after deletion
        const updatedMembers = members.filter(member => member.id !== id);
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
        updateDepartmentCounts(updatedMembers);
        alert('Team member removed successfully!');
      } catch (error) {
        console.error('Error removing team member:', error);
        alert('Failed to remove team member. Please try again.');
      }
    }
  };

  // Handle editing a team member
  const handleEditMember = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      password: '', // Don't pre-fill password for security reasons
      role: member.role,
      department: member.department,
      phone: member.phone || '',
      status: member.status || 'active',
      id: member.id
    });
    setShowAddMemberModal(true);
  };

  // Reset form when opening the add member modal
  const openAddMemberModal = () => {
    resetForm();
    setShowAddMemberModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      department: '',
      phone: '',
      status: 'active'
    });
    setError('');
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: ''
    });
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openTaskModal = (member) => {
    setSelectedMember(member);
    setTaskForm(prev => ({
      ...prev,
      assignedTo: member.id,
      assignedToName: member.name
    }));
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    if (!taskForm.title || !taskForm.dueDate) {
      setError('Title and Due Date are required');
      return;
    }

    try {
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        status: taskForm.status,
        assignedTo: taskForm.assignedTo,
        assignedToName: taskForm.assignedToName,
        createdBy: 'system',
        createdByName: 'System',
        createdAt: new Date().toISOString()
      };

      await createTask(taskData);

      // Close modal and reset form
      setShowTaskModal(false);
      resetTaskForm();

      // Show success message
      alert('Task assigned successfully!');

    } catch (error) {
      console.error('Error assigning task:', error);
      setError(error.message || 'Failed to assign task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.department) {
        throw new Error('All fields are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Create member data
      const newMember = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        phone: formData.phone || '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };

      // Call the API to add the team member
      const response = await teamAPI.addMember(newMember);

      if (response.data) {
        // Update the members list with the new member
        const updatedMembers = [...members, response.data];
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);

        // Update department counts
        updateDepartmentCounts(updatedMembers);

        // Close the modal and reset the form
        setShowAddMemberModal(false);
        resetForm();

        // Show success message
        alert('Team member added successfully!');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      setError(error.response?.data?.message || error.message || 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating an existing team member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.id) throw new Error('Invalid member ID');

      // Validate required fields
      if (!formData.name || !formData.email || !formData.role || !formData.department) {
        throw new Error('All fields are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare updated member data
      const updatedMember = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        phone: formData.phone || '',
        status: formData.status || 'active'
      };

      // Call the API to update the team member
      const response = await teamAPI.updateMember(formData.id, updatedMember);

      if (response.data) {
        // Update the members list with the updated member
        const updatedMembers = members.map(member =>
          member.id === formData.id ? { ...member, ...response.data } : member
        );

        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);

        // Update department counts
        updateDepartmentCounts(updatedMembers);

        // Close the modal and reset the form
        setShowAddMemberModal(false);
        resetForm();

        // Show success message
        alert('Team member updated successfully!');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    if (formData.id) {
      await handleUpdateMember(e);
    } else {
      await handleAddMember(e);
    }
  };

  if (loading) {
    return <div className="loading">Loading team...</div>;
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term) ||
      member.department.toLowerCase().includes(term)
    );

    setFilteredMembers(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member => member.status === tab);
      setFilteredMembers(filtered);
    }
  };

  const handleDepartmentFilter = (dept) => {
    if (dept === 'all') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member => member.department === dept);
      setFilteredMembers(filtered);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="team-container">
      <div className="team-header">
        <div>
          <h2>Team Members</h2>
          <p>Manage your team members and their permissions</p>
        </div>
        <button
          className="add-member-btn"
          onClick={openAddMemberModal}
        >
          <FiPlus /> Add Member
        </button>
      </div>

      <div className="team-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <label>Status:</label>
            <div className="tab-buttons">
              <button
                className={activeTab === 'all' ? 'active' : ''}
                onClick={() => handleTabChange('all')}
              >
                All ({members.length})
              </button>
              <button
                className={activeTab === 'active' ? 'active' : ''}
                onClick={() => handleTabChange('active')}
              >
                Active ({members.filter(m => m.status === 'active').length})
              </button>
              <button
                className={activeTab === 'inactive' ? 'active' : ''}
                onClick={() => handleTabChange('inactive')}
              >
                Inactive ({members.filter(m => m.status === 'inactive').length})
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Department:</label>
            <div className="dropdown">
              <select onChange={(e) => handleDepartmentFilter(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name} ({dept.count})
                  </option>
                ))}
              </select>
              <FiChevronDown className="dropdown-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="team-grid">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <FiUser />
                    </div>
                  )}
                  <span className={`status-dot ${member.status}`}></span>
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <span className={`member-department ${member.department ? member.department.toLowerCase() : ''}`}>
                    {member.department || 'No Department'}
                  </span>
                </div>
                <div className="member-actions">
                  <button
                    className="action-btn assign-btn"
                    onClick={() => openTaskModal(member)}
                    title="Assign Task"
                  >
                    <FiCheckSquare />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditMember(member)}
                    title="Edit Member"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMember(member.id)}
                    title="Delete Member"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="member-details">
                <div className="detail-item">
                  <FiMail className="detail-icon" />
                  <span>{member.email}</span>
                </div>
                <div className="detail-item">
                  <FiPhone className="detail-icon" />
                  <span>{member.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joined:</span>
                  <span>{new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No team members found matching your criteria.</p>
          </div>
        )}
      </div>

      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{formData.id ? 'Edit Team Member' : 'Add New Team Member'}</h3>
              <button className="close-btn" onClick={() => setShowAddMemberModal(false)}>×</button>
            </div>
            <form onSubmit={formData.id ? handleUpdateMember : handleAddMember}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              {!formData.id && (
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required={!formData.id}
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select Role</option>
                    <option value="Designer">Designer</option>
                    <option value="Developer">Developer</option>
                    <option value="Tester">Tester</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Client">Client</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Project Management">Project Management</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              {formData.id && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskModal && selectedMember && (
        <div className="modal-overlay">
          <div className="modal task-modal">
            <div className="modal-header">
              <div>
                <h3>Assign New Task</h3>
                <p className="modal-subtitle">Assigning to {selectedMember.name}</p>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowTaskModal(false);
                  resetTaskForm();
                }}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleTaskSubmit}>
                {error && (
                  <div className="error-message">
                    <FiAlertCircle className="error-icon" />
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="taskTitle">Task Title *</label>
                  <div className="input-with-icon">
                    <FiType className="input-icon" />
                    <input
                      id="taskTitle"
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskInputChange}
                      placeholder="e.g., Design login page mockup"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="taskDescription">Description</label>
                  <div className="input-with-icon">
                    <FiBookmark className="input-icon" />
                    <textarea
                      id="taskDescription"
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskInputChange}
                      placeholder="Add details about the task..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dueDate">Due Date *</label>
                    <div className="input-with-icon">
                      <FiCalendar className="input-icon" />
                      <input
                        id="dueDate"
                        type="date"
                        name="dueDate"
                        value={taskForm.dueDate}
                        onChange={handleTaskInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="taskPriority">Priority</label>
                    <div className="input-with-icon">
                      <FiFlag className="input-icon" />
                      <select
                        id="taskPriority"
                        name="priority"
                        value={taskForm.priority}
                        onChange={handleTaskInputChange}
                        className={`priority-${taskForm.priority}`}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <div className="form-actions-left">
                    <button
                      type="button"
                      className="btn btn-text"
                      onClick={() => {
                        setShowTaskModal(false);
                        resetTaskForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="form-actions-right">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner"></span>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <FiCheckSquare className="btn-icon" />
                          Assign Task
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;