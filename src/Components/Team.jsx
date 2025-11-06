import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiMail, FiPhone, FiUser, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';
import './Team.css';

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

  // Mock data for team members
  useEffect(() => {
    const mockMembers = [
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
      },
    ];

    setMembers(mockMembers);
    setFilteredMembers(mockMembers);
    
    // Update department counts
    const updatedDepartments = departments.map(dept => ({
      ...dept,
      count: mockMembers.filter(member => member.department === dept.name).length
    }));
    setDepartments(updatedDepartments);
  }, []);

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

  const handleAddMember = (e) => {
    e.preventDefault();
    // In a real app, you would add the new member to your backend here
    setShowAddMemberModal(false);
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
          onClick={() => setShowAddMemberModal(true)}
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
                  <span className={`member-department ${member.department.toLowerCase()}`}>
                    {member.department}
                  </span>
                </div>
                <div className="member-actions">
                  <button className="icon-btn" title="Edit">
                    <FiEdit2 />
                  </button>
                  <button className="icon-btn" title="Delete">
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
              <h3>Add New Team Member</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddMemberModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter full name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter email address" required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" placeholder="Enter role" required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select required>
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
                  onClick={() => setShowAddMemberModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Member
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