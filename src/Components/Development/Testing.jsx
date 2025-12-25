import React, { useState } from 'react';
import {
    FaVial,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCode,
    FaPlay,
    FaClock,
    FaChartLine,
    FaFileAlt,
    FaCopy,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';
import './Testing.css';

const Testing = () => {
    const [expandedTest, setExpandedTest] = useState(null);
    const [copiedItem, setCopiedItem] = useState(null);
    const [activeTab, setActiveTab] = useState('unit');

    const testCategories = [
        { id: 'unit', name: 'Unit Testing', icon: <FaCode /> },
        { id: 'integration', name: 'Integration Testing', icon: <FaVial /> },
        { id: 'e2e', name: 'E2E Testing', icon: <FaPlay /> },
        { id: 'performance', name: 'Performance Testing', icon: <FaChartLine /> }
    ];

    const testSuites = {
        unit: [
            {
                id: 'auth-tests',
                name: 'Authentication Tests',
                description: 'Test user authentication and authorization',
                totalTests: 15,
                passed: 13,
                failed: 2,
                duration: '2.3s',
                coverage: 85,
                tests: [
                    {
                        name: 'should login with valid credentials',
                        status: 'passed',
                        duration: '145ms',
                        code: `test('should login with valid credentials', async () => {
  const credentials = { email: 'test@example.com', password: 'password123' };
  const response = await authService.login(credentials);
  expect(response.success).toBe(true);
  expect(response.token).toBeDefined();
});`
                    },
                    {
                        name: 'should reject invalid credentials',
                        status: 'passed',
                        duration: '98ms',
                        code: `test('should reject invalid credentials', async () => {
  const credentials = { email: 'test@example.com', password: 'wrong' };
  await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
});`
                    },
                    {
                        name: 'should validate email format',
                        status: 'failed',
                        duration: '52ms',
                        error: 'Expected validation error but none was thrown',
                        code: `test('should validate email format', () => {
  expect(() => validateEmail('invalid-email')).toThrow();
});`
                    }
                ]
            },
            {
                id: 'api-tests',
                name: 'API Service Tests',
                description: 'Test API service methods',
                totalTests: 20,
                passed: 20,
                failed: 0,
                duration: '3.1s',
                coverage: 92,
                tests: [
                    {
                        name: 'should fetch projects list',
                        status: 'passed',
                        duration: '234ms',
                        code: `test('should fetch projects list', async () => {
  const projects = await api.getProjects();
  expect(Array.isArray(projects)).toBe(true);
  expect(projects.length).toBeGreaterThan(0);
});`
                    },
                    {
                        name: 'should create new project',
                        status: 'passed',
                        duration: '189ms',
                        code: `test('should create new project', async () => {
  const projectData = { name: 'Test Project', description: 'Test' };
  const result = await api.createProject(projectData);
  expect(result.success).toBe(true);
  expect(result.projectId).toBeDefined();
});`
                    }
                ]
            }
        ],
        integration: [
            {
                id: 'workflow-tests',
                name: 'Workflow Integration Tests',
                description: 'Test complete workflow processes',
                totalTests: 12,
                passed: 11,
                failed: 1,
                duration: '5.7s',
                coverage: 78,
                tests: [
                    {
                        name: 'should complete project creation workflow',
                        status: 'passed',
                        duration: '1.2s',
                        code: `test('should complete project creation workflow', async () => {
  // Create project
  const project = await createProject(projectData);
  
  // Assign team
  await assignTeam(project.id, teamMembers);
  
  // Create tasks
  const tasks = await createTasks(project.id, taskList);
  
  expect(project.status).toBe('active');
  expect(tasks.length).toBe(taskList.length);
});`
                    }
                ]
            }
        ],
        e2e: [
            {
                id: 'user-journey',
                name: 'User Journey Tests',
                description: 'End-to-end user flow testing',
                totalTests: 8,
                passed: 8,
                failed: 0,
                duration: '12.4s',
                coverage: 65,
                tests: [
                    {
                        name: 'should complete login to dashboard flow',
                        status: 'passed',
                        duration: '3.2s',
                        code: `test('should complete login to dashboard flow', async () => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('/dashboard');
  expect(page.url()).toContain('/dashboard');
});`
                    }
                ]
            }
        ],
        performance: [
            {
                id: 'load-tests',
                name: 'Load Performance Tests',
                description: 'Test application under load',
                totalTests: 5,
                passed: 4,
                failed: 1,
                duration: '45.2s',
                coverage: 70,
                tests: [
                    {
                        name: 'should handle 100 concurrent users',
                        status: 'passed',
                        duration: '15.3s',
                        code: `test('should handle 100 concurrent users', async () => {
  const users = Array(100).fill(null).map((_, i) => simulateUser(i));
  const results = await Promise.all(users);
  
  const successRate = results.filter(r => r.success).length / results.length;
  expect(successRate).toBeGreaterThan(0.95);
});`
                    },
                    {
                        name: 'should load dashboard in under 2s',
                        status: 'failed',
                        duration: '2.8s',
                        error: 'Load time exceeded threshold: 2.8s > 2.0s',
                        code: `test('should load dashboard in under 2s', async () => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000);
});`
                    }
                ]
            }
        ]
    };

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedItem(id);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const getStatusColor = (status) => {
        return status === 'passed' ? '#10b981' : '#ef4444';
    };

    const currentSuites = testSuites[activeTab] || [];
    const totalTests = currentSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = currentSuites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = currentSuites.reduce((sum, suite) => sum + suite.failed, 0);

    return (
        <div className="testing-container">
            <div className="testing-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaVial />
                    </div>
                    <div className="header-text">
                        <h1>Testing Suite</h1>
                        <p>Automated testing for quality assurance</p>
                    </div>
                </div>

                <div className="testing-stats">
                    <div className="stat-card">
                        <div className="stat-value">{totalTests}</div>
                        <div className="stat-label">Total Tests</div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-value">{totalPassed}</div>
                        <div className="stat-label">Passed</div>
                    </div>
                    <div className="stat-card error">
                        <div className="stat-value">{totalFailed}</div>
                        <div className="stat-label">Failed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%</div>
                        <div className="stat-label">Success Rate</div>
                    </div>
                </div>
            </div>

            <div className="test-categories">
                {testCategories.map(category => (
                    <button
                        key={category.id}
                        className={`category-btn ${activeTab === category.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(category.id)}
                    >
                        {category.icon}
                        <span>{category.name}</span>
                    </button>
                ))}
            </div>

            <div className="test-suites">
                {currentSuites.map(suite => (
                    <div key={suite.id} className="test-suite-card">
                        <div
                            className="suite-header"
                            onClick={() => setExpandedTest(expandedTest === suite.id ? null : suite.id)}
                        >
                            <div className="suite-info">
                                <h3>{suite.name}</h3>
                                <p>{suite.description}</p>
                            </div>
                            <div className="suite-stats">
                                <div className="stat-item">
                                    <FaCheckCircle style={{ color: '#10b981' }} />
                                    <span>{suite.passed} passed</span>
                                </div>
                                {suite.failed > 0 && (
                                    <div className="stat-item">
                                        <FaExclamationTriangle style={{ color: '#ef4444' }} />
                                        <span>{suite.failed} failed</span>
                                    </div>
                                )}
                                <div className="stat-item">
                                    <FaClock />
                                    <span>{suite.duration}</span>
                                </div>
                                <div className="stat-item">
                                    <FaChartLine />
                                    <span>{suite.coverage}% coverage</span>
                                </div>
                                {expandedTest === suite.id ? <FaChevronDown /> : <FaChevronRight />}
                            </div>
                        </div>

                        {expandedTest === suite.id && (
                            <div className="suite-tests">
                                {suite.tests.map((test, idx) => (
                                    <div key={idx} className={`test-item ${test.status}`}>
                                        <div className="test-header">
                                            <div className="test-info">
                                                <div className="test-status" style={{ backgroundColor: getStatusColor(test.status) }}>
                                                    {test.status === 'passed' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                                </div>
                                                <div>
                                                    <h4>{test.name}</h4>
                                                    <span className="test-duration">{test.duration}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyCode(test.code, `test-${suite.id}-${idx}`)}
                                            >
                                                <FaCopy />
                                                {copiedItem === `test-${suite.id}-${idx}` ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>

                                        {test.error && (
                                            <div className="test-error">
                                                <FaExclamationTriangle />
                                                <span>{test.error}</span>
                                            </div>
                                        )}

                                        <div className="test-code">
                                            <pre><code>{test.code}</code></pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Testing;
