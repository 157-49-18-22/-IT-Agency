import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiFlag,
  FiUsers,
  FiList,
  FiGrid
} from 'react-icons/fi';
import './Task.css';
import { taskAPI, projectAPI, userAPI } from '../services/api';

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'completed', label: 'Completed' }
];

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        taskAPI.getAll(),
        projectAPI.getAll(),
        userAPI.getAll()
      ]);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.create(taskData);
      fetchData();
      setShowModal(false);
    } catch (error) {
      alert('Error creating task');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await taskAPI.update(id, taskData);
      fetchData();
      setEditingTask(null);
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Error deleting task');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.updateStatus(id, newStatus);
      fetchData();
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }


  const assignees = useMemo(
    () => Array.from(new Set(tasks.map(t => t.assignee?.name || t.assignee))).sort(),
    [tasks]
  );

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
    if (filterPriority !== 'all') list = list.filter(t => t.priority === filterPriority);

    list.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const aD = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bD = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return sortOrder === 'asc' ? aD - bD : bD - aD;
      }
      if (sortBy === 'priority') {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        return sortOrder === 'asc' ? diff : -diff;
      }
      const diff = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? diff : -diff;
    });
    return list;
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder]);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map(s => [s.key, []]));
    filtered.forEach(t => map[t.status]?.push(t));
    return map;
  }, [filtered]);

  const openModal = (task) => {
    if (task) {
      setEditingId(task.id);
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee: task.assignee || '',
        dueDate: task.dueDate || ''
      });
    } else {
      setEditingId(null);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '' });
    }
    setShowModal(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setTasks(prev => prev.map(t => (t.id === editingId ? { ...t, ...form } : t)));
    } else {
      setTasks(prev => [{ id: `t-${Date.now()}`, comments: 0, tags: [], ...form }, ...prev]);
    }
    setShowModal(false);
  };

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleComplete = (task) => {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t)));
  };

  const toggleSort = (key) => {
    if (sortBy === key) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const renderCard = (t) => (
    <div className={`task-card priority-${t.priority}`} key={t.id}>
      <div className="task-card-header">
        <div className="task-title-row">
          <div className="task-title-text">{t.title}</div>
          <div className={`status-dot ${t.status}`}></div>
        </div>
        <div className="task-actions">
          <button className="icon-btn" title="Edit" onClick={() => openModal(t)}><FiEdit2 /></button>
          <button className="icon-btn" title="Delete" onClick={() => deleteTask(t.id)}><FiTrash2 /></button>
        </div>
      </div>
      {t.description && <div className="task-desc">{t.description}</div>}
      <div className="task-meta">
        <div className="meta-item"><FiClock />{t.dueDate || 'No due'}</div>
        <div className="meta-item"><FiFlag />{t.priority}</div>
        <div className="meta-item"><FiUsers />{t.assignee || 'Unassigned'}</div>
      </div>
      <div className="task-footer">
        <button className="btn-small" onClick={() => toggleComplete(t)}>
          <FiCheckCircle /> {t.status === 'completed' ? 'Mark To Do' : 'Mark Done'}
        </button>
        {t.comments ? <span className="comments-count">{t.comments} comments</span> : <span />}
      </div>
    </div>
  );

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div>
          <h2>Tasks</h2>
          <p>Track work across your team with search, filters, and board/list views.</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><FiList /> List</button>
            <button className={`toggle-btn ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')}><FiGrid /> Board</button>
          </div>
          <button className="primary-btn" onClick={() => openModal(null)}><FiPlus /> Add Task</button>
        </div>
      </div>

      <div className="tasks-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, tags, assignee..." />
        </div>
        <div className="filter">
          <FiFilter className="filter-icon" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <FiChevronDown className="chevron" />
        </div>
        <div className="filter">
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <FiChevronDown className="chevron" />
        </div>
        <div className="filter">
          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
            <option value="all">All Assignees</option>
            {assignees.map(a => (<option key={a} value={a}>{a}</option>))}
          </select>
          <FiChevronDown className="chevron" />
        </div>
        <div className="filter">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>
          <FiChevronDown className="chevron" />
        </div>
        <button className="sort-order" onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}>
          {sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FiCheckCircle size={46} /></div>
          <h3>No tasks found</h3>
          <p>Try adjusting search or filters.</p>
        </div>
      ) : view === 'list' ? (
        <div className="list-view">
          <div className="list-header">
            <div onClick={() => toggleSort('title')} className={sortBy === 'title' ? 'active' : ''}>Task</div>
            <div onClick={() => toggleSort('priority')} className={sortBy === 'priority' ? 'active' : ''}>Priority</div>
            <div>Status</div>
            <div onClick={() => toggleSort('dueDate')} className={sortBy === 'dueDate' ? 'active' : ''}>Due</div>
            <div>Assignee</div>
            <div>Actions</div>
          </div>
          {filtered.map(t => (
            <div className={`list-row ${t.status}`} key={t.id}>
              <div className="title-col">
                <div className="title-text">{t.title}</div>
                {t.description && <div className="sub">{t.description}</div>}
              </div>
              <div><span className={`priority ${t.priority}`}>{t.priority}</span></div>
              <div><span className={`status ${t.status}`}>{STATUSES.find(s => s.key === t.status)?.label}</span></div>
              <div>{t.dueDate || '-'}</div>
              <div className="assignee-cell">
                <div className="avatar">{(t.assignee || '?').charAt(0)}</div>
                <span>{t.assignee || 'Unassigned'}</span>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => openModal(t)}><FiEdit2 /></button>
                <button className="icon-btn" onClick={() => deleteTask(t.id)}><FiTrash2 /></button>
                <button className="icon-btn" onClick={() => toggleComplete(t)}><FiCheckCircle /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="board-view">
          {STATUSES.map(col => (
            <div className="board-col" key={col.key}>
              <div className="col-header">
                <span>{col.label}</span>
                <span className="count">{grouped[col.key]?.length || 0}</span>
              </div>
              <div className="col-body">
                {grouped[col.key].map(t => renderCard(t))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Task' : 'Add Task'}</h3>
              <button className="close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Task description" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assignee</label>
                  <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Assignee name" />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveTask} disabled={!form.title.trim()}>{editingId ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;

