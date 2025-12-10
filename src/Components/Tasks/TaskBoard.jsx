import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaClock, FaUser } from 'react-icons/fa';
import './TaskBoard.css';

const TaskBoard = () => {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState({
        todo: [],
        in_progress: [],
        review: [],
        done: []
    });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState('todo');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            // Simulated data - replace with actual API call
            const mockTasks = {
                todo: [
                    { id: 1, title: 'Design Homepage', description: 'Create wireframes', priority: 'high', assignee: 'John Doe', dueDate: '2024-01-15' },
                    { id: 2, title: 'Setup Database', description: 'Configure MySQL', priority: 'medium', assignee: 'Jane Smith', dueDate: '2024-01-16' }
                ],
                in_progress: [
                    { id: 3, title: 'Implement Login', description: 'JWT authentication', priority: 'high', assignee: 'Mike Johnson', dueDate: '2024-01-14' }
                ],
                review: [
                    { id: 4, title: 'API Documentation', description: 'Write API docs', priority: 'low', assignee: 'Sarah Williams', dueDate: '2024-01-13' }
                ],
                done: [
                    { id: 5, title: 'Project Setup', description: 'Initialize repo', priority: 'high', assignee: 'John Doe', dueDate: '2024-01-10' }
                ]
            };
            setTasks(mockTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleDragStart = (e, taskId, sourceColumn) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.setData('sourceColumn', sourceColumn);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetColumn) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('taskId'));
        const sourceColumn = e.dataTransfer.getData('sourceColumn');

        if (sourceColumn === targetColumn) return;

        const newTasks = { ...tasks };
        const taskIndex = newTasks[sourceColumn].findIndex(t => t.id === taskId);
        const [movedTask] = newTasks[sourceColumn].splice(taskIndex, 1);
        newTasks[targetColumn].push(movedTask);

        setTasks(newTasks);
        // TODO: Call API to update task status
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            ...formData
        };

        setTasks({
            ...tasks,
            [selectedColumn]: [...tasks[selectedColumn], newTask]
        });

        setShowTaskForm(false);
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            assigneeId: '',
            dueDate: ''
        });
        // TODO: Call API to create task
    };

    const columns = [
        { id: 'todo', title: 'To Do', color: '#95a5a6', icon: '📋' },
        { id: 'in_progress', title: 'In Progress', color: '#3498db', icon: '⚙️' },
        { id: 'review', title: 'Review', color: '#f39c12', icon: '👀' },
        { id: 'done', title: 'Done', color: '#2ecc71', icon: '✅' }
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#e74c3c';
            case 'medium': return '#f39c12';
            case 'low': return '#95a5a6';
            default: return '#95a5a6';
        }
    };

    return (
        <div className="task-board-container">
            <div className="task-board-header">
                <h1>Task Board</h1>
                <button
                    className="btn-add-task"
                    onClick={() => {
                        setSelectedColumn('todo');
                        setShowTaskForm(true);
                    }}
                >
                    <FaPlus /> Add Task
                </button>
            </div>

            <div className="board-columns">
                {columns.map(column => (
                    <div
                        key={column.id}
                        className="board-column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className="column-header" style={{ borderTopColor: column.color }}>
                            <div className="column-title">
                                <span className="column-icon">{column.icon}</span>
                                <h3>{column.title}</h3>
                            </div>
                            <span className="task-count">{tasks[column.id]?.length || 0}</span>
                        </div>

                        <div className="column-content">
                            {tasks[column.id]?.map(task => (
                                <div
                                    key={task.id}
                                    className="task-card"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                                >
                                    <div className="task-header">
                                        <h4>{task.title}</h4>
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>

                                    <p className="task-description">{task.description}</p>

                                    <div className="task-footer">
                                        <div className="task-meta">
                                            <span className="task-assignee">
                                                <FaUser /> {task.assignee}
                                            </span>
                                            <span className="task-due-date">
                                                <FaClock /> {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="task-actions">
                                            <button className="btn-icon"><FaEdit /></button>
                                            <button className="btn-icon"><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                className="btn-add-card"
                                onClick={() => {
                                    setSelectedColumn(column.id);
                                    setShowTaskForm(true);
                                }}
                            >
                                <FaPlus /> Add Card
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Form Modal */}
            {showTaskForm && (
                <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Task</h3>
                            <button onClick={() => setShowTaskForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddTask} className="task-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowTaskForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;
