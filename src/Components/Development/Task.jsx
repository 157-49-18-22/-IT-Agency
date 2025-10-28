import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiChevronDown, FiCheckCircle, 
  FiAlertCircle, FiClock, FiPlus, FiUser, FiTag, 
  FiCalendar, FiFlag, FiMoreVertical, FiEdit2, 
  FiTrash2, FiCheck, FiX, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import './Task.css';

const Task = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    assignee: ''
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Mock data for tasks
  useEffect(() => {
    const fetchTasks = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockTasks = [
          {
            id: 'task-001',
            title: 'Implement user authentication',
            description: 'Set up JWT authentication for the application',
            dueDate: '2023-11-15',
            priority: 'high',
            status: 'in-progress',
            assignee: 'John Doe',
            createdAt: new Date('2023-10-20'),
            updatedAt: new Date('2023-10-25')
          },
          {
            id: 'task-002',
            title: 'Design dashboard layout',
            description: 'Create wireframes for the admin dashboard',
            dueDate: '2023-11-05',
            priority: 'medium',
            status: 'todo',
            assignee: 'Jane Smith',
            createdAt: new Date('2023-10-18'),
            updatedAt: new Date('2023-10-18')
          },
          {
            id: 'task-003',
            title: 'Fix login page styling',
            description: 'Adjust responsive design for mobile devices',
            dueDate: '2023-10-30',
            priority: 'low',
            status: 'completed',
            assignee: 'Alex Johnson',
            createdAt: new Date('2023-10-15'),
            updatedAt: new Date('2023-10-22')
          },
          {
            id: 'task-004',
            title: 'API integration for user profile',
            description: 'Connect frontend with backend API for user profile management',
            dueDate: '2023-11-10',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Mike Brown',
            createdAt: new Date('2023-10-22'),
            updatedAt: new Date('2023-10-26')
          },
          {
            id: 'task-005',
            title: 'Write unit tests',
            description: 'Add test coverage for authentication module',
            dueDate: '2023-11-08',
            priority: 'medium',
            status: 'todo',
            assignee: 'Sarah Williams',
            createdAt: new Date('2023-10-24'),
            updatedAt: new Date('2023-10-24')
          }
        ];
        
        setTasks(mockTasks);
        setFilteredTasks(mockTasks);
        setLoading(false);
      }, 800);
    };

    fetchTasks();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(term) || 
          task.description.toLowerCase().includes(term) ||
          task.assignee.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    // Apply assignee filter
    if (assigneeFilter !== 'all') {
      result = result.filter(task => task.assignee === assigneeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.dueDate) - new Date(b.dueDate)
          : new Date(b.dueDate) - new Date(a.dueDate);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortOrder === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'status') {
        const statusOrder = { 'completed': 1, 'in-progress': 2, 'todo': 3 };
        return sortOrder === 'asc'
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      } else if (sortBy === 'assignee') {
        return sortOrder === 'asc'
          ? a.assignee.localeCompare(b.assignee)
          : b.assignee.localeCompare(a.assignee);
      }
      return 0;
    });
    
    setFilteredTasks(result);
  }, [searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder, tasks]);

  // Get unique assignees for filter
  const assignees = [...new Set(tasks.map(task => task.assignee))];

  // Handle input change for new task
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: `task-${Date.now()}`,
      ...newTask,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'todo',
      assignee: ''
    });
    setIsAddingTask(false);
  };

  // Update task status
  const toggleTaskStatus = (taskId, currentStatus) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: currentStatus === 'completed' ? 'todo' : 'completed',
              updatedAt: new Date()
            } 
          : task
      )
    );
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  // Start editing task
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee
    });
  };

  // Save edited task
  const saveEditedTask = () => {
    if (!newTask.title.trim()) return;
    
    setTasks(prev => 
      prev.map(task => 
        task.id === editingTaskId
          ? { 
              ...task, 
              ...newTask,
              updatedAt: new Date()
            }
          : task
      )
    );
    
    setEditingTaskId(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'todo',
      assignee: ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'todo',
      assignee: ''
    });
  };

  // Toggle sort order
  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge completed';
      case 'in-progress':
        return 'status-badge in-progress';
      case 'todo':
      default:
        return 'status-badge todo';
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-badge high';
      case 'medium':
        return 'priority-badge medium';
      case 'low':
      default:
        return 'priority-badge low';
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return formatDate(dueDate);
  };

  // Get days remaining class
  const getDaysRemainingClass = (dueDate) => {
    if (!dueDate) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'days-remaining overdue';
    if (diffDays === 0) return 'days-remaining today';
    if (diffDays <= 3) return 'days-remaining soon';
    return 'days-remaining';
  };

  if (loading) {
    return (
      <div className="task-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-container">
      <div className="task-header">
        <div>
          <h2>Tasks</h2>
          <p>Manage your team's tasks and track progress</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddingTask(true)}
        >
          <FiPlus className="btn-icon" /> Add Task
        </button>
      </div>

      <div className="task-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
        
        <div className="filter-group">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
        
        <div className="filter-group">
          <select 
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
      </div>

      {/* Add/Edit Task Form */}
      {(isAddingTask || editingTaskId) && (
        <div className="task-form">
          <h3>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h3>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={newTask.title}
              onChange={handleInputChange}
              className="form-control"
              autoFocus
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              placeholder="Task description (optional)"
              value={newTask.description}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={newTask.priority}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assignee</label>
              <input
                type="text"
                name="assignee"
                placeholder="Assignee name"
                value={newTask.assignee}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="btn btn-cancel"
              onClick={cancelEditing}
            >
              Cancel
            </button>
            <button 
              className="btn btn-save"
              onClick={editingTaskId ? saveEditedTask : handleAddTask}
              disabled={!newTask.title.trim()}
            >
              {editingTaskId ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiCheckCircle size={48} />
          </div>
          <h3>No tasks found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setAssigneeFilter('all');
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="task-list">
          <div className="task-list-header">
            <div className="task-checkbox"></div>
            <div 
              className={`task-title ${sortBy === 'title' ? 'active' : ''}`}
              onClick={() => toggleSortOrder('title')}
            >
              Task
              {sortBy === 'title' && (
                <span className="sort-icon">
                  {sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </span>
              )}
            </div>
            <div 
              className={`task-assignee ${sortBy === 'assignee' ? 'active' : ''}`}
              onClick={() => toggleSortOrder('assignee')}
            >
              Assignee
              {sortBy === 'assignee' && (
                <span className="sort-icon">
                  {sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </span>
              )}
            </div>
            <div 
              className={`task-priority ${sortBy === 'priority' ? 'active' : ''}`}
              onClick={() => toggleSortOrder('priority')}
            >
              Priority
              {sortBy === 'priority' && (
                <span className="sort-icon">
                  {sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </span>
              )}
            </div>
            <div 
              className={`task-status ${sortBy === 'status' ? 'active' : ''}`}
              onClick={() => toggleSortOrder('status')}
            >
              Status
              {sortBy === 'status' && (
                <span className="sort-icon">
                  {sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </span>
              )}
            </div>
            <div 
              className={`task-due-date ${sortBy === 'dueDate' ? 'active' : ''}`}
              onClick={() => toggleSortOrder('dueDate')}
            >
              Due Date
              {sortBy === 'dueDate' && (
                <span className="sort-icon">
                  {sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </span>
              )}
            </div>
            <div className="task-actions">Actions</div>
          </div>
          
          <div className="task-items">
            {filteredTasks.map(task => (
              <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                <div className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTaskStatus(task.id, task.status)}
                  />
                </div>
                <div className="task-title">
                  <div className="task-title-text">{task.title}</div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                </div>
                <div className="task-assignee">
                  <div className="assignee-avatar">
                    {task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span>{task.assignee || 'Unassigned'}</span>
                </div>
                <div className="task-priority">
                  <span className={getPriorityBadgeClass(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                <div className="task-status">
                  <span className={getStatusBadgeClass(task.status)}>
                    {task.status === 'in-progress' ? 'In Progress' : 
                     task.status === 'todo' ? 'To Do' : 'Completed'}
                  </span>
                </div>
                <div className="task-due-date">
                  <div className={getDaysRemainingClass(task.dueDate)}>
                    {getDaysRemaining(task.dueDate) || 'No due date'}
                  </div>
                  <div className="date-text">{formatDate(task.dueDate)}</div>
                </div>
                <div className="task-actions">
                  <div className="dropdown">
                    <button className="btn-icon" title="More actions">
                      <FiMoreVertical />
                    </button>
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={() => startEditing(task)}
                      >
                        <FiEdit2 className="dropdown-icon" /> Edit
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <FiTrash2 className="dropdown-icon" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;