import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiMail, FiPhone, FiUser, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';
import './Team.css';
import { userAPI, teamAPI } from '../services/api';

const Team = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Development', count: 0 },
    { id: 2, name: 'Design', count: 0 },
    { id: 3, name: 'Marketing', count: 0 },
    { id: 4, name: 'Sales', count: 0 },
    { id: 5, name: 'Support', count: 0 },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  if (loading) {
    return <div className="loading">Loading team...</div>;
  }

  // OLD Mock data
  const oldMockMembers = [
      {
        id: 1,
        name: 'John Doe',
        role: 'Frontend Developer',
        department: 'Development',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        status: 'active',
        joinDate: '2023-01-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'UI/UX Designer',
        department: 'Design',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 234-5678',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        status: 'active',
        joinDate: '2022-11-10',
      },
      {
        id: 3,
        name: 'Robert Johnson',
        role: 'Backend Developer',
        department: 'Development',
        email: 'robert.j@example.com',
        phone: '+1 (555) 345-6789',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        status: 'active',
        joinDate: '2023-03-22',
      },
      {
        id: 4,
        name: 'Emily Davis',
        role: 'Marketing Manager',
        department: 'Marketing',
        email: 'emily.d@example.com',
        phone: '+1 (555) 456-7890',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        status: 'active',
        joinDate: '2022-09-05',
      },
      {
        id: 5,
        name: 'Michael Wilson',
        role: 'Sales Executive',
        department: 'Sales',
        email: 'michael.w@example.com',
        phone: '+1 (555) 567-8901',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        status: 'inactive',
        joinDate: '2023-05-18',
      }
    ];

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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      status: 'active'
    });
    setError('');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.role || !formData.department) {
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

  const updateDepartmentCounts = (memberList) => {
    const counts = {};
    memberList.forEach(member => {
      counts[member.department] = (counts[member.department] || 0) + 1;
    });

    setDepartments(prev => 
      prev.map(dept => ({
        ...dept,
        count: counts[dept.name] || 0
      }))
    );
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
                    className="icon-btn" 
                    title="Edit"
                    onClick={() => handleEditMember(member)}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="icon-btn" 
                    title="Delete"
                    onClick={() => handleDeleteMember(member.id)}
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
          <div className="modal-content">
            <div className="modal-header">
              <h3>{formData.id ? 'Edit Team Member' : 'Add New Team Member'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddMemberModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Full Name</label>
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
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Tester">Tester</option>
                  <option value="Client">Client</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (formData.id ? 'Update Member' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;