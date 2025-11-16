const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const Client = require('../models/Client');

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    
    if (status && ['Active', 'Inactive', 'Prospect'].includes(status)) {
      whereClause.status = status;
    }

    const clients = await Client.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      raw: true
    });
    
    // Add a default logo if not present
    const clientsWithLogo = clients.map(client => ({
      ...client,
      logo: client.logo || '🏢' // Default emoji logo
    }));
    
    res.json(clientsWithLogo);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new client
exports.createClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const transaction = await Client.sequelize.transaction();
  
  try {
    const { name, contact, email, phone, company, status = 'Active', address } = req.body;
    
    // Check if client with email already exists
    const existingClient = await Client.findOne({ 
      where: { email },
      transaction
    });
    
    if (existingClient) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'A client with this email already exists' 
      });
    }

    const client = await Client.create({
      name,
      contact,
      email,
      phone: phone || null,
      company: company || null,
      status,
      address: address || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { transaction });

    await transaction.commit();
    
    res.status(201).json({
      success: true,
      data: {
        ...client.get({ plain: true }),
        logo: client.logo || '🏢' // Default emoji logo
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating client:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const transaction = await Client.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, contact, email, phone, company, status, address } = req.body;
    
    // Find the client with a lock to prevent concurrent updates
    const client = await Client.findByPk(id, { 
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id } // Not the current client
        },
        transaction
      });
      
      if (existingClient) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use by another client' 
        });
      }
    }

    // Update client fields
    const updateData = {
      name: name || client.name,
      contact: contact || client.contact,
      email: email || client.email,
      phone: phone !== undefined ? phone : client.phone,
      company: company !== undefined ? company : client.company,
      status: status || client.status,
      address: address !== undefined ? address : client.address,
      updatedAt: new Date()
    };

    await Client.update(updateData, {
      where: { id },
      transaction
    });

    await transaction.commit();
    
    // Get the updated client
    const updatedClient = await Client.findByPk(id, { raw: true });
    
    res.json({
      success: true,
      data: {
        ...updatedClient,
        logo: updatedClient.logo || '🏢' // Default emoji logo
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating client:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  const transaction = await Client.sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if client exists
    const client = await Client.findByPk(id, { transaction });
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }

    // In a real app, you might want to check for related records first
    // For example, if clients have associated projects, invoices, etc.
    
    // Soft delete (if you have a deletedAt column)
    await Client.destroy({ 
      where: { id },
      transaction
    });
    
    // Or hard delete:
    // await Client.destroy({ 
    //   where: { id },
    //   force: true, // Bypass soft delete
    //   transaction
    // });

    await transaction.commit();
    
    res.json({ 
      success: true,
      message: 'Client deleted successfully' 
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting client:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search clients
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query must be at least 2 characters long' 
      });
    }

    const searchQuery = `%${query}%`;
    
    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchQuery } },
          { email: { [Op.like]: searchQuery } },
          { contact: { [Op.like]: searchQuery } },
          { company: { [Op.like]: searchQuery } }
        ]
      },
      order: [['name', 'ASC']],
      raw: true
    });

    // Add default logos
    const clientsWithLogo = clients.map(client => ({
      ...client,
      logo: client.logo || '🏢' // Default emoji logo
    }));

    res.json({
      success: true,
      data: clientsWithLogo,
      count: clients.length
    });
    
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id, { raw: true });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Add default logo
    client.logo = client.logo || '🏢';
    
    res.json({
      success: true,
      data: client
    });
    
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
