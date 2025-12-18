import React, { useState } from 'react';
import { FaChartLine, FaClock, FaCheckCircle, FaTachometerAlt } from 'react-icons/fa';
import './TestingPages.css';

const PerformanceTesting = () => {
    const [performanceMetrics, setPerformanceMetrics] = useState({
        pageLoadTime: 2.3,
        firstContentfulPaint: 1.2,
        timeToInteractive: 3.1,
        totalPageSize: 1.8,
        numberOfRequests: 45
    });

    const [performanceTests, setPerformanceTests] = useState([
        { id: 1, page: 'Home Page', loadTime: 2.1, status: 'Pass', threshold: 3.0 },
        { id: 2, page: 'Dashboard', loadTime: 2.8, status: 'Pass', threshold: 3.0 },
        { id: 3, page: 'Login Page', loadTime: 1.5, status: 'Pass', threshold: 2.0 },
        { id: 4, page: 'Search Results', loadTime: 3.5, status: 'Fail', threshold: 3.0 },
        { id: 5, page: 'Product Details', loadTime: 2.2, status: 'Pass', threshold: 3.0 }
    ]);

    return (
        <div className="testing-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Performance Testing</h1>
                    <p>Monitor and analyze application performance metrics</p>
                </div>
                <button className="btn-primary">
                    <FaTachometerAlt /> Run Performance Test
                </button>
            </div>

            {/* Performance Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <FaClock className="metric-icon" />
                    <div className="metric-info">
                        <h3>{performanceMetrics.pageLoadTime}s</h3>
                        <p>Page Load Time</p>
                        <span className="metric-status good">Good</span>
                    </div>
                </div>

                <div className="metric-card">
                    <FaChartLine className="metric-icon" />
                    <div className="metric-info">
                        <h3>{performanceMetrics.firstContentfulPaint}s</h3>
                        <p>First Contentful Paint</p>
                        <span className="metric-status good">Good</span>
                    </div>
                </div>

                <div className="metric-card">
                    <FaTachometerAlt className="metric-icon" />
                    <div className="metric-info">
                        <h3>{performanceMetrics.timeToInteractive}s</h3>
                        <p>Time to Interactive</p>
                        <span className="metric-status average">Average</span>
                    </div>
                </div>

                <div className="metric-card">
                    <FaChartLine className="metric-icon" />
                    <div className="metric-info">
                        <h3>{performanceMetrics.totalPageSize}MB</h3>
                        <p>Total Page Size</p>
                        <span className="metric-status good">Good</span>
                    </div>
                </div>

                <div className="metric-card">
                    <FaChartLine className="metric-icon" />
                    <div className="metric-info">
                        <h3>{performanceMetrics.numberOfRequests}</h3>
                        <p>Number of Requests</p>
                        <span className="metric-status good">Good</span>
                    </div>
                </div>
            </div>

            {/* Performance Tests Table */}
            <div className="performance-tests">
                <h3>Page Performance Tests</h3>
                <div className="table-responsive">
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Load Time</th>
                                <th>Threshold</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceTests.map(test => (
                                <tr key={test.id}>
                                    <td>{test.page}</td>
                                    <td>{test.loadTime}s</td>
                                    <td>{test.threshold}s</td>
                                    <td>
                                        <span className={`status-badge ${test.status.toLowerCase()}`}>
                                            {test.status === 'Pass' ? <FaCheckCircle /> : <FaClock />}
                                            {test.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-sm btn-outline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Recommendations */}
            <div className="recommendations">
                <h3>Performance Recommendations</h3>
                <div className="recommendation-list">
                    <div className="recommendation-item">
                        <FaChartLine className="rec-icon warning" />
                        <div className="rec-content">
                            <h4>Optimize Search Results Page</h4>
                            <p>Load time exceeds threshold. Consider implementing pagination or lazy loading.</p>
                        </div>
                    </div>
                    <div className="recommendation-item">
                        <FaCheckCircle className="rec-icon success" />
                        <div className="rec-content">
                            <h4>Enable Browser Caching</h4>
                            <p>Implement caching strategies to improve repeat visit performance.</p>
                        </div>
                    </div>
                    <div className="recommendation-item">
                        <FaChartLine className="rec-icon info" />
                        <div className="rec-content">
                            <h4>Compress Images</h4>
                            <p>Reduce image file sizes to improve page load times.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceTesting;
