import React, { useState } from 'react';
import {
    FaCheckCircle,
    FaPlay,
    FaStop,
    FaClock,
    FaExclamationTriangle,
    FaCode,
    FaBug,
    FaChartLine,
    FaFileAlt,
    FaUpload
} from 'react-icons/fa';
import './SelfTesting.css';

const SelfTesting = () => {
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTests, setSelectedTests] = useState([]);

    const testCases = [
        {
            id: 'func-1',
            category: 'Functionality',
            name: 'All features working as expected',
            description: 'Verify that all implemented features function correctly',
            status: 'pending'
        },
        {
            id: 'func-2',
            category: 'Functionality',
            name: 'Form validations working',
            description: 'Check all form fields have proper validation',
            status: 'pending'
        },
        {
            id: 'func-3',
            category: 'Functionality',
            name: 'API responses handled correctly',
            description: 'Verify proper handling of success and error responses',
            status: 'pending'
        },
        {
            id: 'ui-1',
            category: 'UI/UX',
            name: 'Responsive design on all devices',
            description: 'Test layout on mobile, tablet, and desktop',
            status: 'pending'
        },
        {
            id: 'ui-2',
            category: 'UI/UX',
            name: 'Loading states implemented',
            description: 'Check for loading indicators during async operations',
            status: 'pending'
        },
        {
            id: 'ui-3',
            category: 'UI/UX',
            name: 'Error messages displayed properly',
            description: 'Verify user-friendly error messages are shown',
            status: 'pending'
        },
        {
            id: 'perf-1',
            category: 'Performance',
            name: 'Page load time under 3 seconds',
            description: 'Measure and verify page load performance',
            status: 'pending'
        },
        {
            id: 'perf-2',
            category: 'Performance',
            name: 'No memory leaks',
            description: 'Check for proper cleanup and memory management',
            status: 'pending'
        },
        {
            id: 'sec-1',
            category: 'Security',
            name: 'Input sanitization implemented',
            description: 'Verify all user inputs are sanitized',
            status: 'pending'
        },
        {
            id: 'sec-2',
            category: 'Security',
            name: 'Authentication working correctly',
            description: 'Test login, logout, and session management',
            status: 'pending'
        },
        {
            id: 'code-1',
            category: 'Code Quality',
            name: 'No console errors or warnings',
            description: 'Check browser console for any errors',
            status: 'pending'
        },
        {
            id: 'code-2',
            category: 'Code Quality',
            name: 'Code follows standards',
            description: 'Verify adherence to coding standards',
            status: 'pending'
        }
    ];

    const categories = [...new Set(testCases.map(t => t.category))];

    const handleTestSelection = (testId) => {
        setSelectedTests(prev =>
            prev.includes(testId)
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const selectAllTests = () => {
        setSelectedTests(testCases.map(t => t.id));
    };

    const deselectAllTests = () => {
        setSelectedTests([]);
    };

    const runTests = () => {
        if (selectedTests.length === 0) {
            alert('Please select at least one test to run');
            return;
        }

        setIsRunning(true);
        // Simulate test execution
        setTimeout(() => {
            const results = selectedTests.map(testId => ({
                testId,
                status: Math.random() > 0.2 ? 'passed' : 'failed',
                timestamp: new Date().toISOString(),
                duration: Math.floor(Math.random() * 500) + 100
            }));
            setTestResults(results);
            setIsRunning(false);
        }, 2000);
    };

    const getTestResult = (testId) => {
        return testResults.find(r => r.testId === testId);
    };

    const passedTests = testResults.filter(r => r.status === 'passed').length;
    const failedTests = testResults.filter(r => r.status === 'failed').length;

    return (
        <div className="self-testing-container">
            <div className="self-testing-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaCheckCircle />
                    </div>
                    <div className="header-text">
                        <h1>Self-Testing Checklist</h1>
                        <p>Verify your code before submission</p>
                    </div>
                </div>

                {testResults.length > 0 && (
                    <div className="test-summary">
                        <div className="summary-card passed">
                            <FaCheckCircle />
                            <div>
                                <div className="summary-value">{passedTests}</div>
                                <div className="summary-label">Passed</div>
                            </div>
                        </div>
                        <div className="summary-card failed">
                            <FaExclamationTriangle />
                            <div>
                                <div className="summary-value">{failedTests}</div>
                                <div className="summary-label">Failed</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <FaClock />
                            <div>
                                <div className="summary-value">
                                    {testResults.reduce((sum, r) => sum + r.duration, 0)}ms
                                </div>
                                <div className="summary-label">Total Time</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="test-controls">
                <div className="control-buttons">
                    <button className="control-btn primary" onClick={runTests} disabled={isRunning}>
                        {isRunning ? (
                            <>
                                <FaClock className="spinning" />
                                Running Tests...
                            </>
                        ) : (
                            <>
                                <FaPlay />
                                Run Selected Tests
                            </>
                        )}
                    </button>
                    <button className="control-btn" onClick={selectAllTests}>
                        Select All
                    </button>
                    <button className="control-btn" onClick={deselectAllTests}>
                        Deselect All
                    </button>
                </div>
                <div className="selected-count">
                    {selectedTests.length} of {testCases.length} tests selected
                </div>
            </div>

            <div className="test-categories-grid">
                {categories.map(category => {
                    const categoryTests = testCases.filter(t => t.category === category);
                    const categoryPassed = categoryTests.filter(t => {
                        const result = getTestResult(t.id);
                        return result && result.status === 'passed';
                    }).length;
                    const categoryFailed = categoryTests.filter(t => {
                        const result = getTestResult(t.id);
                        return result && result.status === 'failed';
                    }).length;

                    return (
                        <div key={category} className="category-section">
                            <div className="category-header">
                                <h3>{category}</h3>
                                {(categoryPassed > 0 || categoryFailed > 0) && (
                                    <div className="category-stats">
                                        {categoryPassed > 0 && (
                                            <span className="stat passed">{categoryPassed} passed</span>
                                        )}
                                        {categoryFailed > 0 && (
                                            <span className="stat failed">{categoryFailed} failed</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="test-list">
                                {categoryTests.map(test => {
                                    const result = getTestResult(test.id);
                                    const isSelected = selectedTests.includes(test.id);

                                    return (
                                        <div
                                            key={test.id}
                                            className={`test-card ${isSelected ? 'selected' : ''} ${result ? result.status : ''}`}
                                            onClick={() => handleTestSelection(test.id)}
                                        >
                                            <div className="test-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                />
                                            </div>
                                            <div className="test-content">
                                                <h4>{test.name}</h4>
                                                <p>{test.description}</p>
                                                {result && (
                                                    <div className="test-result">
                                                        {result.status === 'passed' ? (
                                                            <span className="result-badge passed">
                                                                <FaCheckCircle /> Passed
                                                            </span>
                                                        ) : (
                                                            <span className="result-badge failed">
                                                                <FaExclamationTriangle /> Failed
                                                            </span>
                                                        )}
                                                        <span className="result-time">{result.duration}ms</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="submission-guidelines">
                <h3><FaFileAlt /> Submission Guidelines</h3>
                <div className="guidelines-content">
                    <div className="guideline-item">
                        <FaCheckCircle />
                        <div>
                            <h4>All tests must pass</h4>
                            <p>Ensure all selected tests show a "Passed" status before submitting</p>
                        </div>
                    </div>
                    <div className="guideline-item">
                        <FaCode />
                        <div>
                            <h4>Code quality check</h4>
                            <p>Review your code for proper formatting, comments, and documentation</p>
                        </div>
                    </div>
                    <div className="guideline-item">
                        <FaBug />
                        <div>
                            <h4>No known bugs</h4>
                            <p>Fix all identified bugs before marking the task as complete</p>
                        </div>
                    </div>
                    <div className="guideline-item">
                        <FaUpload />
                        <div>
                            <h4>Ready for review</h4>
                            <p>Once all tests pass, submit your code for peer review</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfTesting;
