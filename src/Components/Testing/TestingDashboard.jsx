import React, { useState, useEffect } from 'react';
import { FaChartLine, FaBug, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import './TestingPages.css';

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
        testingProgress: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            // Mock data - replace with actual API calls
            setStats({
                totalTestCases: 45,
                passedTests: 32,
                failedTests: 8,
                pendingTests: 5,
                totalBugs: 23,
                criticalBugs: 3,
                openBugs: 12,
                resolvedBugs: 11,
                testingProgress: 71
            });
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
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="testing-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Testing Dashboard</h1>
                    <p>Overview of testing progress and metrics</p>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="progress-overview">
                <h3>Overall Testing Progress</h3>
                <div className="progress-bar-large">
                    <div className="progress-fill" style={{ width: `${stats.testingProgress}%` }}>
                        <span>{stats.testingProgress}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Test Cases Stats */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <FaCheckCircle size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.totalTestCases}</h3>
                        <p>Total Test Cases</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
                        <FaCheckCircle size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.passedTests}</h3>
                        <p>Passed Tests</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
                        <FaExclamationTriangle size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.failedTests}</h3>
                        <p>Failed Tests</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #ff9800)' }}>
                        <FaClock size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.pendingTests}</h3>
                        <p>Pending Tests</p>
                    </div>
                </div>

                {/* Bug Stats */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6c757d, #495057)' }}>
                        <FaBug size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.totalBugs}</h3>
                        <p>Total Bugs</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545, #bd2130)' }}>
                        <FaBug size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.criticalBugs}</h3>
                        <p>Critical Bugs</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>
                        <FaBug size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.openBugs}</h3>
                        <p>Open Bugs</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #218838)' }}>
                        <FaCheckCircle size={32} />
                    </div>
                    <div className="stat-details">
                        <h3>{stats.resolvedBugs}</h3>
                        <p>Resolved Bugs</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>Test Execution Status</h3>
                    <div className="chart-placeholder">
                        <div className="pie-chart">
                            <div className="pie-segment passed" style={{ '--percentage': (stats.passedTests / stats.totalTestCases * 100) }}></div>
                            <div className="pie-segment failed" style={{ '--percentage': (stats.failedTests / stats.totalTestCases * 100) }}></div>
                            <div className="pie-segment pending" style={{ '--percentage': (stats.pendingTests / stats.totalTestCases * 100) }}></div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-color passed"></span>
                                <span>Passed: {stats.passedTests}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color failed"></span>
                                <span>Failed: {stats.failedTests}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color pending"></span>
                                <span>Pending: {stats.pendingTests}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Bug Status Distribution</h3>
                    <div className="chart-placeholder">
                        <div className="bar-chart">
                            <div className="bar-item">
                                <div className="bar" style={{ height: `${(stats.openBugs / stats.totalBugs * 100)}%`, background: '#17a2b8' }}></div>
                                <span>Open</span>
                            </div>
                            <div className="bar-item">
                                <div className="bar" style={{ height: `${(stats.resolvedBugs / stats.totalBugs * 100)}%`, background: '#28a745' }}></div>
                                <span>Resolved</span>
                            </div>
                            <div className="bar-item">
                                <div className="bar" style={{ height: `${(stats.criticalBugs / stats.totalBugs * 100)}%`, background: '#dc3545' }}></div>
                                <span>Critical</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <FaCheckCircle className="activity-icon success" />
                        <div className="activity-details">
                            <p><strong>Test Case TC-045</strong> passed successfully</p>
                            <span className="activity-time">2 hours ago</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <FaBug className="activity-icon danger" />
                        <div className="activity-details">
                            <p><strong>Critical Bug BUG-023</strong> reported</p>
                            <span className="activity-time">4 hours ago</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <FaCheckCircle className="activity-icon success" />
                        <div className="activity-details">
                            <p><strong>Bug BUG-018</strong> resolved and verified</p>
                            <span className="activity-time">6 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestingDashboard;
