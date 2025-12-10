import React, { useState, useEffect } from 'react';
import {
    FaProjectDiagram,
    FaChartLine,
    FaCheckCircle,
    FaExclamationTriangle,
    FaClock,
    FaBell,
    FaTasks,
    FaUsers,
    FaClipboardCheck
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import './EnhancedDashboard.css';

const EnhancedDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [myDashboard, setMyDashboard] = useState(null);
    const [stageSummary, setStageSummary] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data in parallel
            const [metricsRes, myDashRes, stageRes, approvalsRes] = await Promise.all([
                dashboardAPI.getMetrics(),
                dashboardAPI.getMyDashboard(),
                dashboardAPI.getStageSummary(),
                dashboardAPI.getPendingApprovals()
            ]);

            setMetrics(metricsRes.data.data);
            setMyDashboard(myDashRes.data.data);
            setStageSummary(stageRes.data.data);
            setPendingApprovals(approvalsRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="enhanced-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back! Here's what's happening with your projects.</p>
                </div>
                <div className="dashboard-actions">
                    <button className="btn-refresh" onClick={fetchDashboardData}>
                        <FaClock /> Refresh
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
                {/* Projects by Stage */}
                <div className="metric-card stage-card">
                    <div className="metric-header">
                        <h3>Projects by Stage</h3>
                        <FaProjectDiagram className="metric-icon" />
                    </div>
                    <div className="stage-metrics">
                        <div className="stage-item uiux">
                            <span className="stage-label">UI/UX</span>
                            <span className="stage-value">{metrics?.projectsByStage?.uiux || 0}</span>
                        </div>
                        <div className="stage-item development">
                            <span className="stage-label">Development</span>
                            <span className="stage-value">{metrics?.projectsByStage?.development || 0}</span>
                        </div>
                        <div className="stage-item testing">
                            <span className="stage-label">Testing</span>
                            <span className="stage-value">{metrics?.projectsByStage?.testing || 0}</span>
                        </div>
                        <div className="stage-item completed">
                            <span className="stage-label">Completed</span>
                            <span className="stage-value">{metrics?.projectsByStage?.completed || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="metric-card approvals-card">
                    <div className="metric-header">
                        <h3>Pending Approvals</h3>
                        <FaClipboardCheck className="metric-icon" />
                    </div>
                    <div className="metric-value-large">
                        {metrics?.pendingApprovals || 0}
                    </div>
                    <Link to="/approvals" className="metric-link">
                        View all approvals →
                    </Link>
                </div>

                {/* Overdue Tasks */}
                <div className="metric-card overdue-card">
                    <div className="metric-header">
                        <h3>Overdue Tasks</h3>
                        <FaExclamationTriangle className="metric-icon" />
                    </div>
                    <div className="metric-value-large warning">
                        {metrics?.overdueTasks || 0}
                    </div>
                    <Link to="/tasks" className="metric-link">
                        View tasks →
                    </Link>
                </div>

                {/* My Tasks Summary */}
                <div className="metric-card tasks-card">
                    <div className="metric-header">
                        <h3>My Tasks</h3>
                        <FaTasks className="metric-icon" />
                    </div>
                    <div className="tasks-summary">
                        <div className="task-stat">
                            <span className="task-label">Total</span>
                            <span className="task-value">{myDashboard?.summary?.totalTasks || 0}</span>
                        </div>
                        <div className="task-stat">
                            <span className="task-label">In Progress</span>
                            <span className="task-value">{myDashboard?.tasks?.filter(t => t.status === 'in_progress').length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    Projects
                </button>
                <button
                    className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    My Tasks
                </button>
                <button
                    className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    Approvals
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <OverviewTab
                        stageSummary={stageSummary}
                        teamWorkload={metrics?.teamWorkload}
                        recentActivities={metrics?.recentActivities}
                    />
                )}

                {activeTab === 'projects' && (
                    <ProjectsTab projects={myDashboard?.projects} />
                )}

                {activeTab === 'tasks' && (
                    <TasksTab tasks={myDashboard?.tasks} />
                )}

                {activeTab === 'approvals' && (
                    <ApprovalsTab approvals={pendingApprovals} />
                )}
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ stageSummary, teamWorkload, recentActivities }) => (
    <div className="overview-tab">
        {/* Stage Summary */}
        <div className="section">
            <h2>Project Stage Summary</h2>
            <div className="stage-summary-grid">
                {stageSummary?.slice(0, 6).map((project, index) => (
                    <div key={index} className="project-stage-card">
                        <div className="project-stage-header">
                            <h4>{project.project_name}</h4>
                            <span className={`status-badge ${project.status}`}>
                                {project.status}
                            </span>
                        </div>
                        <div className="stage-progress">
                            <div className="stage-info">
                                <span className="current-stage">{project.currentStageName || 'Not Started'}</span>
                                <span className="progress-text">{project.currentStageProgress || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${project.currentStageProgress || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="project-stats">
                            <div className="stat">
                                <span className="stat-label">Total Tasks</span>
                                <span className="stat-value">{project.total_tasks || 0}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Completed</span>
                                <span className="stat-value">{project.completed_tasks || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Team Workload */}
        <div className="section">
            <h2>Team Workload</h2>
            <div className="team-workload-grid">
                {teamWorkload?.slice(0, 8).map((member, index) => (
                    <div key={index} className="team-member-card">
                        <div className="member-avatar">
                            {member.avatar ? (
                                <img src={member.avatar} alt={member.name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {member.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="member-info">
                            <h4>{member.name}</h4>
                            <p className="member-role">{member.role}</p>
                        </div>
                        <div className="member-workload">
                            <div className="workload-bar">
                                <div
                                    className={`workload-fill ${member.activeTasks > 5 ? 'high' : member.activeTasks > 3 ? 'medium' : 'low'}`}
                                    style={{ width: `${Math.min((member.activeTasks / 10) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="workload-text">{member.activeTasks} active tasks</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Recent Activities */}
        <div className="section">
            <h2>Recent Activities</h2>
            <div className="activities-list">
                {recentActivities?.slice(0, 10).map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-icon">
                            <FaBell />
                        </div>
                        <div className="activity-content">
                            <p className="activity-description">{activity.description}</p>
                            <span className="activity-time">
                                {new Date(activity.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Projects Tab Component
const ProjectsTab = ({ projects }) => (
    <div className="projects-tab">
        <div className="projects-grid">
            {projects?.map((project, index) => (
                <Link key={index} to={`/projects/${project.id}`} className="project-card">
                    <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge ${project.status}`}>
                            {project.status}
                        </span>
                    </div>
                    <div className="project-stage">
                        <span className="stage-label">Current Stage:</span>
                        <span className="stage-name">{project.currentStageName || 'Not Started'}</span>
                    </div>
                    <div className="project-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${project.currentStageProgress || 0}%` }}
                            ></div>
                        </div>
                        <span className="progress-text">{project.currentStageProgress || 0}%</span>
                    </div>
                </Link>
            ))}
        </div>
    </div>
);

// Tasks Tab Component
const TasksTab = ({ tasks }) => (
    <div className="tasks-tab">
        <div className="tasks-list">
            {tasks?.map((task, index) => (
                <div key={index} className="task-item">
                    <div className="task-header">
                        <h4>{task.title}</h4>
                        <span className={`priority-badge ${task.priority}`}>
                            {task.priority}
                        </span>
                    </div>
                    <div className="task-meta">
                        <span className="task-project">{task.projectName}</span>
                        <span className="task-stage">{task.stageName}</span>
                    </div>
                    <div className="task-footer">
                        <span className={`status-badge ${task.status}`}>
                            {task.status}
                        </span>
                        {task.dueDate && (
                            <span className="task-due">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Approvals Tab Component
const ApprovalsTab = ({ approvals }) => (
    <div className="approvals-tab">
        <div className="approvals-list">
            {approvals?.map((approval, index) => (
                <div key={index} className="approval-item">
                    <div className="approval-header">
                        <h4>{approval.title}</h4>
                        <span className={`urgency-badge ${approval.urgency_status}`}>
                            {approval.urgency_status}
                        </span>
                    </div>
                    <div className="approval-meta">
                        <span className="approval-project">{approval.project_name}</span>
                        <span className="approval-type">{approval.approvalType}</span>
                    </div>
                    <div className="approval-footer">
                        <span className="approval-requester">
                            From: {approval.requested_by_name}
                        </span>
                        <span className="approval-date">
                            {new Date(approval.requestedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default EnhancedDashboard;
