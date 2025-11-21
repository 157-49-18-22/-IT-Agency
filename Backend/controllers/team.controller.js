const { User } = require('../models/sql');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Get all team members with department counts
 */
exports.getTeamMembers = async (req, res) => {
  try {
    // Get all active users
    const members = await User.findAll({
      where: { status: 'active' },
      attributes: [
        'id', 'name', 'email', 'role', 'department', 'avatar', 'joinDate'
      ],
      order: [['name', 'ASC']]
    });

    // Calculate department counts
    const departmentCounts = await User.findAll({
      where: { status: 'active' },
      attributes: [
        'department',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['department'],
      raw: true
    });

    // Format department counts
    const departments = departmentCounts.map(dept => ({
      name: dept.department || 'Unassigned',
      count: parseInt(dept.count, 10)
    }));

    res.json({
      success: true,
      data: {
        members,
        departments
      }
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: error.message
    });
  }
};

/**
 * Add a new team member
 */
exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, role, department, phone } = req.body;

    // Define valid roles
    const validRoles = ['Admin', 'Project Manager', 'Developer', 'Designer', 'Tester', 'Client'];
    
    // Validate role
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        validRoles: validRoles
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Generate a default password (you might want to implement a proper password generation logic)
    const defaultPassword = 'welcome123'; // In a real app, generate a secure random password and send it via email
    
    // Create new team member
    const newMember = await User.create({
      name,
      email,
      password: defaultPassword, // Add the default password
      role,
      department,
      phone,
      status: 'active',
      joinDate: new Date(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      preferences: {
        theme: 'light',
        pushNotifications: true,
        emailNotifications: true
      },
      skills: [],
      socialLinks: {}
    });

    // Remove sensitive data from response
    const memberData = newMember.get({ plain: true });
    delete memberData.password;
    delete memberData.resetPasswordToken;
    delete memberData.resetPasswordExpires;

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: memberData
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding team member',
      error: error.errors ? error.errors.map(e => e.message) : error.message
    });
  }
};

/**
 * Update a team member
 */
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone, status } = req.body;

    const member = await User.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== member.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Update member
    await member.update({
      name: name || member.name,
      email: email || member.email,
      role: role || member.role,
      department: department !== undefined ? department : member.department,
      phone: phone !== undefined ? phone : member.phone,
      status: status || member.status
    });

    // Remove sensitive data from response
    const memberData = member.get({ plain: true });
    delete memberData.password;
    delete memberData.resetPasswordToken;
    delete memberData.resetPasswordExpires;

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: memberData
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team member',
      error: error.errors ? error.errors.map(e => e.message) : error.message
    });
  }
};

/**
 * Remove a team member (soft delete)
 */
exports.removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await User.findByPk(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Soft delete by setting status to inactive
    await member.update({ status: 'inactive' });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: error.message
    });
  }
};
