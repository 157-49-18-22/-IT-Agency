import React, { useState, useEffect, useContext } from 'react';
import { FiClock, FiPlay, FiPause, FiSquare, FiPlus, FiCalendar, FiFilter, FiDownload, FiTrash } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import { timeLogsAPI, projectsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './TimeLogs.css';

const TimeLogs = () => {
    const { currentUser } = useAuth();
    const { getProjectsByUser, projects: contextProjects } = useContext(ProjectContext);

    const [timeLogs, setTimeLogs] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [myProjects, setMyProjects] = useState([]);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentLogId, setCurrentLogId] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [newLog, setNewLog] = useState({
        taskName: '',
        description: '',
        hours: 0,
        minutes: 0,
        projectId: ''
    });

    // Load projects
    useEffect(() => {
        const loadProjects = async () => {
            let userProjects = [];

            if (currentUser?.id) {
                userProjects = getProjectsByUser(currentUser.id);
            }

            // Fallback to all projects if user has no specific assignments
            if ((!userProjects || userProjects.length === 0) && contextProjects?.length > 0) {
                userProjects = contextProjects;
            }

            if (userProjects.length > 0) {
                setMyProjects(userProjects);
                // Select first project by default if none selected
                if (!selectedProject) {
                    setSelectedProject(userProjects[0]);
                }
            }
        };

        loadProjects();
    }, [currentUser, getProjectsByUser, contextProjects]);

    // Load time logs
    useEffect(() => {
        fetchTimeLogs();
    }, [currentUser]);

    const fetchTimeLogs = async () => {
        if (!currentUser?.id) return;
        try {
            setIsLoading(true);
            const response = await timeLogsAPI.getLogs({ userId: currentUser.id });
            if (response.data.success) {
                setTimeLogs(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching time logs", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Timer functions
    const startTimer = async () => {
        if (!selectedProject) {
            toast.error("Please select a project first");
            return;
        }
        if (!isTimerRunning) {
            try {
                // Create a new time log entry in the database
                const logData = {
                    projectId: selectedProject.id,
                    description: `Working on ${selectedProject.name || selectedProject.projectName}`,
                    startTime: new Date().toISOString(),
                    isBillable: true
                };

                const response = await timeLogsAPI.createLog(logData);
                if (response.data.success) {
                    setCurrentLogId(response.data.data.id);
                    toast.success("Timer started!");

                    // Start the local timer
                    const startTime = Date.now();
                    const interval = setInterval(() => {
                        setElapsedTime(Date.now() - startTime);
                    }, 1000);
                    setTimerInterval(interval);
                    setIsTimerRunning(true);
                }
            } catch (error) {
                console.error("Error starting timer:", error);
                toast.error("Failed to start timer");
            }
        }
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        setIsTimerRunning(false);
    };

    const stopTimer = async () => {
        // 1. Stop local timer immediately
        clearInterval(timerInterval);
        setIsTimerRunning(false);
        const finalElapsedTime = elapsedTime; // Capture current elapsed time

        // 2. Reset UI immediately so user sees 00:00:00
        setElapsedTime(0);
        setCurrentLogId(null);

        if (finalElapsedTime > 0) {
            try {
                if (currentLogId) {
                    // Scenario A: We have an active log ID, stop it
                    const response = await timeLogsAPI.stopTimer(currentLogId);
                    if (response.data.success) {
                        toast.success("Time logged successfully!");
                    }
                } else {
                    // Scenario B: We lost the log ID (e.g. refresh), but have elapsed time.
                    // Create a new completed entry.
                    const endTime = new Date();
                    const startTime = new Date(endTime.getTime() - finalElapsedTime);

                    const logData = {
                        projectId: selectedProject?.id,
                        description: `Working on ${selectedProject?.name || selectedProject?.projectName || 'Project'}`,
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                        duration: Math.floor(finalElapsedTime / 1000), // duration in seconds
                        isBillable: true
                    };
                    await timeLogsAPI.createLog(logData);
                    toast.success("Time logged successfully!");
                }
            } catch (error) {
                console.error("Error saving time log:", error);
                toast.error("Failed to save time log");
            } finally {
                // 3. Refresh logs to show the new entry
                fetchTimeLogs();
            }
        }
    };

    const formatTime = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSaveLog = async (e) => {
        e.preventDefault();

        if (!selectedProject && !newLog.projectId) {
            toast.error("Please select a project");
            return;
        }

        const startTimeDate = new Date();
        const durationMinutes = (parseInt(newLog.hours) * 60) + parseInt(newLog.minutes);
        const endTimeDate = new Date(startTimeDate.getTime());
        const startTimeCalculated = new Date(endTimeDate.getTime() - durationMinutes * 60000);

        const logData = {
            projectId: newLog.projectId || selectedProject?.id,
            description: newLog.taskName + (newLog.description ? `: ${newLog.description}` : ''),
            startTime: startTimeCalculated.toISOString(),
            endTime: endTimeDate.toISOString(),
            isBillable: true
        };

        try {
            const response = await timeLogsAPI.createLog(logData);
            if (response.data.success) {
                toast.success("Time log saved successfully");
                setTimeLogs([response.data.data, ...timeLogs]);
                setShowAddModal(false);
                setNewLog({ taskName: '', description: '', hours: 0, minutes: 0, projectId: '' });
                setElapsedTime(0);
            }
        } catch (error) {
            console.error("Error saving time log", error);
            toast.error("Failed to save time log");
        }
    };

    const handleDeleteLog = async (id) => {
        if (!window.confirm("Are you sure you want to delete this log?")) return;
        try {
            const response = await timeLogsAPI.deleteLog(id);
            if (response.data.success || response.status === 200) {
                toast.success("Log deleted");
                setTimeLogs(timeLogs.filter(log => log.id !== id));
            }
        } catch (error) {
            console.error("Error deleting log", error);
            toast.error("Failed to delete log");
        }
    }

    const filteredLogs = timeLogs.filter(log => {
        if (filterDate) {
            return log.startTime && log.startTime.startsWith(filterDate);
        }
        return true;
    });

    const totalHours = filteredLogs.reduce((sum, log) => sum + (log.duration * 60000), 0) / 3600000;

    return (
        <div className="time-tracking-container">
            {/* Header */}
            <div className="time-header">
                <div>
                    <h2>Time Tracking</h2>
                    <p>Track your working hours and boost productivity</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium btn-primary" onClick={() => setShowAddModal(true)}>
                        <FiPlus /> Add Manual Log
                    </button>
                </div>
            </div>

            {/* Timer Widget */}
            <div className="timer-widget">
                <div className="timer-header-row">
                    <div className="timer-title">Active Session Timer</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <label style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Choose Project:
                        </label>
                        <div className="project-selector-wrapper">
                            <FiClock size={16} />
                            <select
                                className="project-selector"
                                value={selectedProject?.id || ''}
                                onChange={(e) => {
                                    const project = myProjects.find(p => p.id === parseInt(e.target.value));
                                    setSelectedProject(project);
                                }}
                            >
                                {myProjects.length === 0 ? (
                                    <option value="" disabled>No projects assigned yet</option>
                                ) : (
                                    <>
                                        <option value="" disabled>Select a project...</option>
                                        {myProjects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.projectName || project.name || `Project ${project.id}`}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="timer-display">
                    {formatTime(elapsedTime)}
                </div>
                <div className="timer-controls">
                    {!isTimerRunning ? (
                        <button className="timer-btn start" onClick={startTimer}>
                            <FiPlay /> Start
                        </button>
                    ) : (
                        <button className="timer-btn pause" onClick={pauseTimer}>
                            <FiPause /> Pause
                        </button>
                    )}
                    <button className="timer-btn stop" onClick={stopTimer}>
                        <FiSquare /> Stop & Save
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Hours Recorded</span>
                    <span className="stat-value highlight-blue">
                        {totalHours.toFixed(1)}<span style={{ fontSize: '1rem', marginLeft: '4px' }}>h</span>
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Logs</span>
                    <span className="stat-value highlight-purple">{filteredLogs.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Avg. Per Day</span>
                    <span className="stat-value highlight-green">
                        {filteredLogs.length > 0
                            ? (totalHours / Math.max(1, new Set(filteredLogs.map(l => l.startTime ? l.startTime.split('T')[0] : '')).size)).toFixed(1)
                            : 0}
                        <span style={{ fontSize: '1rem', marginLeft: '4px' }}>h</span>
                    </span>
                </div>
            </div>

            {/* Filter */}
            <div className="tool-bar">
                <div className="filter-wrapper">
                    <FiFilter color="#a3aed0" />
                    <input
                        type="date"
                        className="filter-input"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    {filterDate && (
                        <button className="btn-clear" onClick={() => setFilterDate('')}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Time Logs List */}
            <div className="logs-section">
                <h3>Recent Activity</h3>
                {isLoading ? (
                    <div className="loading-spinner">Loading logs...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <FiClock size={48} />
                        <p>No time logs found. Start tracking your time!</p>
                    </div>
                ) : (
                    <div className="logs-list">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="log-item">
                                <div className="log-details">
                                    <div className="log-meta-row" style={{ marginBottom: '0.5rem' }}>
                                        <h4>{log.description || 'No Description'}</h4>
                                        {log.project && (
                                            <span className="project-badge">
                                                {log.project.name || log.project.projectName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="log-meta-row">
                                        <div className="meta-item">
                                            <FiCalendar size={14} />
                                            {log.startTime ? new Date(log.startTime).toLocaleDateString() : 'N/A'}
                                        </div>
                                        {log.startTime && log.endTime && (
                                            <div className="meta-item">
                                                | {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        <div className="meta-item">
                                            • {log.user?.name || currentUser?.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="log-duration">
                                    {formatTime(log.duration * 60000)}
                                </div>

                                <button className="btn-delete" onClick={() => handleDeleteLog(log.id)} title="Delete Log">
                                    <FiTrash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Log Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Time Log</h3>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSaveLog}>
                            <div className="form-group">
                                <label>Project *</label>
                                <select
                                    className="form-control"
                                    value={selectedProject ? selectedProject.id : newLog.projectId}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        setNewLog({ ...newLog, projectId: pid });
                                        setSelectedProject(myProjects.find(p => p.id == pid));
                                    }}
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {myProjects.map(p => (
                                        <option key={p.id} value={p.id}>{p.projectName || p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Task Name / Title *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newLog.taskName}
                                    onChange={(e) => setNewLog({ ...newLog, taskName: e.target.value })}
                                    placeholder="What did you work on?"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    value={newLog.description}
                                    onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                                    placeholder="Brief description of the work done"
                                    rows="3"
                                />
                            </div>

                            <div className="time-grid-inputs">
                                <div className="form-group">
                                    <label>Hours</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={newLog.hours}
                                        onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Minutes</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        className="form-control"
                                        value={newLog.minutes}
                                        onChange={(e) => setNewLog({ ...newLog, minutes: e.target.value })}
                                    />
                                </div>
                            </div>

                            {elapsedTime > 0 && (
                                <div style={{
                                    padding: '1rem',
                                    background: '#f4f7fe',
                                    borderRadius: '12px',
                                    marginTop: '1rem',
                                    color: '#4318ff',
                                    fontWeight: '500',
                                    textAlign: 'center'
                                }}>
                                    Timer Duration Captured: {formatTime(elapsedTime)}
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    Save Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeLogs;
