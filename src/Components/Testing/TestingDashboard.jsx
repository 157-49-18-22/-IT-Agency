import React, { useState, useEffect } from 'react';
import {
    FaChartLine, FaBug, FaCheckCircle, FaClock,
    FaExclamationTriangle, FaVial, FaChartPie, FaCalendarAlt
} from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './TestingPages.css';

import { testingAPI } from '../../services/api';

const TestingDashboard = () => {
    const [stats, setStats] = useState({
        totalTestCases: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        totalBugs: 0,
        criticalBugs: 0,
        openBugs: 0,
        resolvedBugs: 0,
        testingProgress: 0,
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J'], // Keep mock for now or calculate dynamic
        recentActivity: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await testingAPI.getDashboardStats();
            if (response.data.success) {
                setStats(prev => ({
                    ...prev,
                    ...response.data.data
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="testing-page-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading testing insights...</p>
                </div>
            </div>
        );
    }

    // Chart Data
    const statusChartData = {
        labels: ['Passed', 'Failed', 'Pending'],
        datasets: [
            {
                data: [stats.passedTests, stats.failedTests, stats.pendingTests],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const bugChartData = {
        labels: ['Critical', 'Open', 'Resolved'],
        datasets: [
            {
                label: 'Bugs',
                data: [stats.criticalBugs, stats.openBugs, stats.resolvedBugs],
                backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#1e293b' }
            },
            title: {
                display: false,
            },
        },
        cutout: '70%',
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#64748b' }
            },
            y: {
                grid: { color: '#e2e8f0', drawBorder: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    return (
        <div className="testing-page-container">
            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Quality Assurance Dashboard</h1>
                    <p>Track testing progress, bugs, and deliverables in real-time.</p>
                </div>
                <div className="banner-stats">
                    <div className="banner-stat">
                        <span className="label">Total Coverage</span>
                        <span className="value">{stats.testingProgress}%</span>
                    </div>
                    <div className="banner-stat">
                        <span className="label">Total Bugs</span>
                        <span className="value text-danger">{stats.totalBugs}</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="dashboard-grid">
                {/* Key Metrics */}
                <div className="card overview-card glass-panel">
                    <div className="card-header">
                        <h3><FaVial className="icon-blue" /> Test Execution</h3>
                    </div>
                    <div className="metrics-row">
                        <div className="metric-item">
                            <span className="metric-value">{stats.totalTestCases}</span>
                            <span className="metric-label">Total Tests</span>
                        </div>
                        <div className="metric-separator"></div>
                        <div className="metric-item">
                            <span className="metric-value text-success">{stats.passedTests}</span>
                            <span className="metric-label">Passed</span>
                        </div>
                        <div className="metric-separator"></div>
                        <div className="metric-item">
                            <span className="metric-value text-danger">{stats.failedTests}</span>
                            <span className="metric-label">Failed</span>
                        </div>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${(stats.passedTests / stats.totalTestCases) * 100}%` }}></div>
                        </div>
                        <span className="progress-text">{(stats.passedTests / stats.totalTestCases * 100).toFixed(1)}% Passing Rate</span>
                    </div>
                </div>

                <div className="card chart-card glass-panel">
                    <div className="card-header">
                        <h3><FaChartPie className="icon-purple" /> Status Distribution</h3>
                    </div>
                    <div className="chart-container-small">
                        <Doughnut data={statusChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card chart-card glass-panel">
                    <div className="card-header">
                        <h3><FaBug className="icon-red" /> Bug Analytics</h3>
                    </div>
                    <div className="chart-container-small">
                        <Bar data={bugChartData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="activity-grid">
                <div className="card activity-card glass-panel">
                    <div className="card-header">
                        <h3><FaClock className="icon-yellow" /> Recent Activity</h3>
                    </div>
                    <div className="activity-list">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity, index) => (
                                <div className="activity-item" key={index}>
                                    <div className={`activity-icon-wrapper ${activity.type === 'bug' ? 'warning' : 'success'}`}>
                                        {activity.type === 'bug' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                                    </div>
                                    <div className="activity-content">
                                        <span className="activity-msg">{activity.msg}</span>
                                        <span className="activity-time">{new Date(activity.time).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="activity-item">
                                <span className="activity-msg">No recent activity</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card quick-stats-card glass-panel">
                    <div className="card-header">
                        <h3><FaCalendarAlt className="icon-green" /> Today's Focus</h3>
                    </div>
                    <div className="focus-list">
                        <div className="focus-item">
                            <div className="check-ring"></div>
                            <span>Verify Login API Rate Limiting</span>
                            <span className="priority-tag high">High</span>
                        </div>
                        <div className="focus-item">
                            <div className="check-ring"></div>
                            <span>Cross-browser testing (Safari)</span>
                            <span className="priority-tag medium">Med</span>
                        </div>
                        <div className="focus-item">
                            <div className="check-ring"></div>
                            <span>Update regression suite</span>
                            <span className="priority-tag low">Low</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestingDashboard;
