import React, { useState, useEffect, useContext } from 'react';
import { FiClock, FiPlay, FiPause, FiSquare, FiPlus, FiCalendar, FiFilter, FiDownload, FiTrash } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import { timeLogsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './Code.css';

const TimeLogs = () => {
    const { currentUser } = useAuth();
    const { getProjectsByUser } = useContext(ProjectContext);

    const [timeLogs, setTimeLogs] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [myProjects, setMyProjects] = useState([]);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [newLog, setNewLog] = useState({
        taskName: '',
        description: '',
        hours: 0,
        minutes: 0,
        projectId: ''
    });

    // Load approved projects
    useEffect(() => {
        if (currentUser?.id) {
            const allProjects = getProjectsByUser(currentUser.id);
            const approvedProjects = allProjects.filter(project => {
                const isApproved = project.currentStage === 'development' ||
                    project.currentStage === 'testing' ||
                    project.status === 'approved' ||
                    project.uiuxApproved === true;
                return isApproved;
            });

            if (approvedProjects.length > 0) {
                setMyProjects(approvedProjects);
                setSelectedProject(approvedProjects[0]);
            }
        }
    }, [currentUser, getProjectsByUser]);

    // Load time logs
    useEffect(() => {
        fetchTimeLogs();
    }, [currentUser]); // Fetch logs when user loads

    const fetchTimeLogs = async () => {
        try {
            setIsLoading(true);
            const response = await timeLogsAPI.getLogs(); // Assuming this fetches user's logs
            if (response.data.success) {
                setTimeLogs(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching time logs", error);
            toast.error("Failed to load time logs");
        } finally {
            setIsLoading(false);
        }
    }

    // Timer functions
    const startTimer = () => {
        if (!isTimerRunning) {
            const startTime = Date.now() - elapsedTime;
            const interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 1000);
            setTimerInterval(interval);
            setIsTimerRunning(true);
        }
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        setIsTimerRunning(false);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        setIsTimerRunning(false);
        if (elapsedTime > 0) {
            // Set hours and minutes from elapsed time for the modal
            const totalSeconds = Math.floor(elapsedTime / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);

            setNewLog(prev => ({ ...prev, hours, minutes }));
            setShowAddModal(true);
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

        // Calculate times
        const startTimeDate = new Date();
        // If manual entry, we assume it just finished or happened today. 
        // Backend expects startTime and endTime for duration
        const durationMinutes = (parseInt(newLog.hours) * 60) + parseInt(newLog.minutes);
        const endTimeDate = new Date(startTimeDate.getTime());
        const startTimeCalculated = new Date(endTimeDate.getTime() - durationMinutes * 60000);

        const logData = {
            projectId: selectedProject?.id || newLog.projectId,
            description: newLog.taskName + (newLog.description ? `: ${newLog.description}` : ''), // Combine or separate based on backend model
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
        <div className="code-container">
            <div className="code-header">
                <div>
                    <h2>Time Tracking</h2>
                    <p>Track your working hours and productivity</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {myProjects.length > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '8px',
                            color: 'white'
                        }}>
                            <FiClock size={18} />
                            <select
                                value={selectedProject?.id || ''}
                                onChange={(e) => {
                                    const project = myProjects.find(p => p.id === parseInt(e.target.value));
                                    setSelectedProject(project);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    padding: '4px 8px'
                                }}
                            >
                                {myProjects.map(project => (
                                    <option key={project.id} value={project.id} style={{ background: '#1f2937', color: 'white' }}>
                                        {project.projectName || `Project ${project.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FiPlus /> Add Manual Log
                    </button>
                </div>
            </div>

            {/* Timer Widget */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                color: 'white'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Active Timer</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'monospace' }}>
                    {formatTime(elapsedTime)}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {!isTimerRunning ? (
                        <button
                            onClick={startTimer}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500'
                            }}
                        >
                            <FiPlay /> Start
                        </button>
                    ) : (
                        <button
                            onClick={pauseTimer}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500'
                            }}
                        >
                            <FiPause /> Pause
                        </button>
                    )}
                    <button
                        onClick={stopTimer}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                        }}
                    >
                        <FiSquare /> Stop & Save
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '8px' }}>Total Hours</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{totalHours.toFixed(1)}h</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '8px' }}>Total Logs</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#764ba2' }}>{filteredLogs.length}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '8px' }}>Avg per Day</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                        {/* Simple logic for avg per day based on unique dates in logs */}
                        {filteredLogs.length > 0 ? (totalHours / Math.max(1, new Set(filteredLogs.map(l => l.startTime ? l.startTime.split('T')[0] : '')).size)).toFixed(1) : 0}h
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="code-toolbar" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiFilter />
                    <label>Filter by Date:</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            fontSize: '14px'
                        }}
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Time Logs List */}
            <div>
                <h3 style={{ marginBottom: '16px' }}>Time Logs</h3>
                {isLoading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : filteredLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        <FiClock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No time logs found. Start tracking your time!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredLogs.map(log => (
                            <div
                                key={log.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto auto', // added auto for delete btn
                                    gap: '16px',
                                    alignItems: 'start'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{log.description || 'No Description'}</h4>
                                        {log.project && (
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                background: '#e0e7ff',
                                                color: '#667eea',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {log.project.name}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#6c757d' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiCalendar size={14} />
                                            {new Date(log.startTime).toLocaleDateString()}
                                        </span>
                                        <span>{log.user?.name || currentUser?.name}</span>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#667eea',
                                    fontFamily: 'monospace'
                                }}>
                                    {formatTime(log.duration * 60000)}
                                </div>
                                <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', marginTop: '5px' }}
                                >
                                    <FiTrash />
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
                                    value={selectedProject ? selectedProject.id : newLog.projectId}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        setNewLog({ ...newLog, projectId: pid });
                                        setSelectedProject(myProjects.find(p => p.id == pid));
                                    }}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                >
                                    <option value="">Select Project</option>
                                    {myProjects.map(p => (
                                        <option key={p.id} value={p.id}>{p.projectName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Task Name / Title *</label>
                                <input
                                    type="text"
                                    value={newLog.taskName}
                                    onChange={(e) => setNewLog({ ...newLog, taskName: e.target.value })}
                                    placeholder="What did you work on?"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newLog.description}
                                    onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                                    placeholder="Brief description of the work done"
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Hours</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newLog.hours}
                                        onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Minutes</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={newLog.minutes}
                                        onChange={(e) => setNewLog({ ...newLog, minutes: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>
                            {elapsedTime > 0 && (
                                <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '8px', marginTop: '12px' }}>
                                    <strong>Timer Duration:</strong> {formatTime(elapsedTime)}
                                </div>
                            )}
                            <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Log
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
