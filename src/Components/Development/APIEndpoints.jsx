import React, { useState } from 'react';
import {
    FaCodeBranch,
    FaSearch,
    FaCopy,
    FaCheckCircle,
    FaServer,
    FaLock,
    FaKey,
    FaExclamationTriangle,
    FaCode,
    FaChevronDown,
    FaChevronRight,
    FaPlay
} from 'react-icons/fa';
import './APIEndpoints.css';

const APIEndpoints = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('all');
    const [expandedEndpoint, setExpandedEndpoint] = useState(null);
    const [copiedItem, setCopiedItem] = useState(null);
    const [activeTab, setActiveTab] = useState('endpoints');

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.example.com';

    const endpoints = [
        {
            id: 'auth-login',
            category: 'Authentication',
            method: 'POST',
            path: '/api/auth/login',
            description: 'Authenticate user and receive JWT token',
            authentication: 'None',
            requestBody: {
                email: 'string (required)',
                password: 'string (required)'
            },
            responseExample: {
                success: true,
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'developer'
                }
            },
            errorCodes: [
                { code: 400, message: 'Invalid credentials' },
                { code: 429, message: 'Too many login attempts' }
            ]
        },
        {
            id: 'auth-register',
            category: 'Authentication',
            method: 'POST',
            path: '/api/auth/register',
            description: 'Register a new user account',
            authentication: 'None',
            requestBody: {
                name: 'string (required)',
                email: 'string (required)',
                password: 'string (required, min 8 characters)',
                role: 'string (optional)'
            },
            responseExample: {
                success: true,
                message: 'User registered successfully',
                userId: 123
            },
            errorCodes: [
                { code: 400, message: 'Validation error' },
                { code: 409, message: 'Email already exists' }
            ]
        },
        {
            id: 'projects-list',
            category: 'Projects',
            method: 'GET',
            path: '/api/projects',
            description: 'Get list of all projects',
            authentication: 'Bearer Token',
            queryParams: {
                status: 'string (optional) - Filter by status',
                page: 'number (optional) - Page number',
                limit: 'number (optional) - Items per page'
            },
            responseExample: {
                success: true,
                data: [
                    {
                        id: 1,
                        projectName: 'E-commerce Platform',
                        status: 'in-progress',
                        startDate: '2024-01-15',
                        clientName: 'ABC Corp'
                    }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 5,
                    totalItems: 48
                }
            },
            errorCodes: [
                { code: 401, message: 'Unauthorized' },
                { code: 403, message: 'Insufficient permissions' }
            ]
        },
        {
            id: 'projects-create',
            category: 'Projects',
            method: 'POST',
            path: '/api/projects',
            description: 'Create a new project',
            authentication: 'Bearer Token (Admin only)',
            requestBody: {
                projectName: 'string (required)',
                description: 'string (required)',
                clientName: 'string (required)',
                budget: 'number (required)',
                startDate: 'date (required)',
                deadline: 'date (required)',
                technologies: 'array (optional)'
            },
            responseExample: {
                success: true,
                message: 'Project created successfully',
                projectId: 456
            },
            errorCodes: [
                { code: 400, message: 'Validation error' },
                { code: 401, message: 'Unauthorized' },
                { code: 403, message: 'Admin access required' }
            ]
        },
        {
            id: 'projects-detail',
            category: 'Projects',
            method: 'GET',
            path: '/api/projects/:id',
            description: 'Get detailed information about a specific project',
            authentication: 'Bearer Token',
            pathParams: {
                id: 'number (required) - Project ID'
            },
            responseExample: {
                success: true,
                data: {
                    id: 1,
                    projectName: 'E-commerce Platform',
                    description: 'Full-featured online shopping platform',
                    status: 'in-progress',
                    progress: 65,
                    team: [
                        { id: 1, name: 'John Doe', role: 'developer' },
                        { id: 2, name: 'Jane Smith', role: 'designer' }
                    ]
                }
            },
            errorCodes: [
                { code: 401, message: 'Unauthorized' },
                { code: 404, message: 'Project not found' }
            ]
        },
        {
            id: 'tasks-list',
            category: 'Tasks',
            method: 'GET',
            path: '/api/tasks',
            description: 'Get list of tasks assigned to current user',
            authentication: 'Bearer Token',
            queryParams: {
                projectId: 'number (optional) - Filter by project',
                status: 'string (optional) - Filter by status',
                priority: 'string (optional) - Filter by priority'
            },
            responseExample: {
                success: true,
                data: [
                    {
                        id: 1,
                        title: 'Implement user authentication',
                        description: 'Add JWT-based authentication',
                        status: 'in-progress',
                        priority: 'high',
                        dueDate: '2024-12-30'
                    }
                ]
            },
            errorCodes: [
                { code: 401, message: 'Unauthorized' }
            ]
        },
        {
            id: 'tasks-update',
            category: 'Tasks',
            method: 'PUT',
            path: '/api/tasks/:id',
            description: 'Update task status or details',
            authentication: 'Bearer Token',
            pathParams: {
                id: 'number (required) - Task ID'
            },
            requestBody: {
                status: 'string (optional)',
                progress: 'number (optional)',
                notes: 'string (optional)'
            },
            responseExample: {
                success: true,
                message: 'Task updated successfully'
            },
            errorCodes: [
                { code: 400, message: 'Validation error' },
                { code: 401, message: 'Unauthorized' },
                { code: 404, message: 'Task not found' }
            ]
        },
        {
            id: 'code-submit',
            category: 'Code',
            method: 'POST',
            path: '/api/code/submit',
            description: 'Submit code for review',
            authentication: 'Bearer Token',
            requestBody: {
                projectId: 'number (required)',
                taskId: 'number (required)',
                code: 'string (required)',
                language: 'string (required)',
                description: 'string (required)',
                files: 'array (optional)'
            },
            responseExample: {
                success: true,
                message: 'Code submitted for review',
                submissionId: 789
            },
            errorCodes: [
                { code: 400, message: 'Validation error' },
                { code: 401, message: 'Unauthorized' }
            ]
        },
        {
            id: 'testcases-list',
            category: 'Testing',
            method: 'GET',
            path: '/api/testcases/:projectId',
            description: 'Get test cases for a project',
            authentication: 'Bearer Token',
            pathParams: {
                projectId: 'number (required) - Project ID'
            },
            responseExample: {
                success: true,
                data: [
                    {
                        id: 1,
                        title: 'Login functionality test',
                        status: 'passed',
                        priority: 'high',
                        lastRun: '2024-12-24T10:30:00Z'
                    }
                ]
            },
            errorCodes: [
                { code: 401, message: 'Unauthorized' },
                { code: 404, message: 'Project not found' }
            ]
        }
    ];

    const categories = [...new Set(endpoints.map(e => e.category))];
    const methods = ['all', 'GET', 'POST', 'PUT', 'DELETE'];

    const filteredEndpoints = endpoints.filter(endpoint => {
        const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMethod = selectedMethod === 'all' || endpoint.method === selectedMethod;
        return matchesSearch && matchesMethod;
    });

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(id);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const getMethodColor = (method) => {
        const colors = {
            GET: '#10b981',
            POST: '#3b82f6',
            PUT: '#f59e0b',
            DELETE: '#ef4444',
            PATCH: '#8b5cf6'
        };
        return colors[method] || '#6b7280';
    };

    return (
        <div className="api-endpoints-container">
            <div className="api-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaCodeBranch />
                    </div>
                    <div className="header-text">
                        <h1>API Endpoints</h1>
                        <p>Complete API documentation for backend integration</p>
                    </div>
                </div>

                <div className="api-base-url">
                    <FaServer />
                    <span>Base URL:</span>
                    <code>{apiBaseUrl}</code>
                    <button onClick={() => copyToClipboard(apiBaseUrl, 'base-url')}>
                        <FaCopy />
                        {copiedItem === 'base-url' ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="api-tabs">
                <button
                    className={`api-tab ${activeTab === 'endpoints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('endpoints')}
                >
                    <FaCodeBranch /> Endpoints
                </button>
                <button
                    className={`api-tab ${activeTab === 'authentication' ? 'active' : ''}`}
                    onClick={() => setActiveTab('authentication')}
                >
                    <FaLock /> Authentication
                </button>
            </div>

            {activeTab === 'endpoints' && (
                <>
                    <div className="api-filters">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search endpoints..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="method-filters">
                            {methods.map(method => (
                                <button
                                    key={method}
                                    className={`method-filter ${selectedMethod === method ? 'active' : ''}`}
                                    onClick={() => setSelectedMethod(method)}
                                >
                                    {method.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="endpoints-list">
                        {categories.map(category => {
                            const categoryEndpoints = filteredEndpoints.filter(e => e.category === category);
                            if (categoryEndpoints.length === 0) return null;

                            return (
                                <div key={category} className="endpoint-category">
                                    <h2 className="category-title">{category}</h2>

                                    {categoryEndpoints.map(endpoint => (
                                        <div key={endpoint.id} className="endpoint-card">
                                            <div
                                                className="endpoint-header"
                                                onClick={() => setExpandedEndpoint(
                                                    expandedEndpoint === endpoint.id ? null : endpoint.id
                                                )}
                                            >
                                                <div className="endpoint-summary">
                                                    <span
                                                        className="method-badge"
                                                        style={{ backgroundColor: getMethodColor(endpoint.method) }}
                                                    >
                                                        {endpoint.method}
                                                    </span>
                                                    <code className="endpoint-path">{endpoint.path}</code>
                                                </div>
                                                <div className="endpoint-meta">
                                                    <span className="endpoint-description">{endpoint.description}</span>
                                                    {expandedEndpoint === endpoint.id ? <FaChevronDown /> : <FaChevronRight />}
                                                </div>
                                            </div>

                                            {expandedEndpoint === endpoint.id && (
                                                <div className="endpoint-details">
                                                    <div className="detail-section">
                                                        <h4><FaLock /> Authentication</h4>
                                                        <div className="auth-badge">
                                                            {endpoint.authentication}
                                                        </div>
                                                    </div>

                                                    {endpoint.pathParams && (
                                                        <div className="detail-section">
                                                            <h4>Path Parameters</h4>
                                                            <div className="params-list">
                                                                {Object.entries(endpoint.pathParams).map(([key, value]) => (
                                                                    <div key={key} className="param-item">
                                                                        <code>{key}</code>
                                                                        <span>{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {endpoint.queryParams && (
                                                        <div className="detail-section">
                                                            <h4>Query Parameters</h4>
                                                            <div className="params-list">
                                                                {Object.entries(endpoint.queryParams).map(([key, value]) => (
                                                                    <div key={key} className="param-item">
                                                                        <code>{key}</code>
                                                                        <span>{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {endpoint.requestBody && (
                                                        <div className="detail-section">
                                                            <h4>Request Body</h4>
                                                            <div className="code-block">
                                                                <div className="code-header">
                                                                    <span>JSON</span>
                                                                    <button onClick={() => copyToClipboard(
                                                                        JSON.stringify(endpoint.requestBody, null, 2),
                                                                        `req-${endpoint.id}`
                                                                    )}>
                                                                        <FaCopy />
                                                                        {copiedItem === `req-${endpoint.id}` ? 'Copied!' : 'Copy'}
                                                                    </button>
                                                                </div>
                                                                <pre><code>{JSON.stringify(endpoint.requestBody, null, 2)}</code></pre>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="detail-section">
                                                        <h4>Response Example</h4>
                                                        <div className="code-block">
                                                            <div className="code-header">
                                                                <span>JSON</span>
                                                                <button onClick={() => copyToClipboard(
                                                                    JSON.stringify(endpoint.responseExample, null, 2),
                                                                    `res-${endpoint.id}`
                                                                )}>
                                                                    <FaCopy />
                                                                    {copiedItem === `res-${endpoint.id}` ? 'Copied!' : 'Copy'}
                                                                </button>
                                                            </div>
                                                            <pre><code>{JSON.stringify(endpoint.responseExample, null, 2)}</code></pre>
                                                        </div>
                                                    </div>

                                                    <div className="detail-section">
                                                        <h4><FaExclamationTriangle /> Error Codes</h4>
                                                        <div className="error-codes">
                                                            {endpoint.errorCodes.map((error, idx) => (
                                                                <div key={idx} className="error-item">
                                                                    <span className="error-code">{error.code}</span>
                                                                    <span className="error-message">{error.message}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'authentication' && (
                <div className="auth-documentation">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <FaKey />
                            <h3>JWT Authentication</h3>
                        </div>
                        <p>Most endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:</p>

                        <div className="code-block">
                            <div className="code-header">
                                <span>Request Header</span>
                                <button onClick={() => copyToClipboard('Authorization: Bearer YOUR_TOKEN_HERE', 'auth-header')}>
                                    <FaCopy />
                                    {copiedItem === 'auth-header' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre><code>Authorization: Bearer YOUR_TOKEN_HERE</code></pre>
                        </div>
                    </div>

                    <div className="auth-card">
                        <div className="auth-card-header">
                            <FaLock />
                            <h3>Getting a Token</h3>
                        </div>
                        <p>To obtain a JWT token, make a POST request to the login endpoint:</p>

                        <div className="code-block">
                            <div className="code-header">
                                <span>cURL Example</span>
                                <button onClick={() => copyToClipboard(
                                    `curl -X POST ${apiBaseUrl}/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email": "user@example.com", "password": "yourpassword"}'`,
                                    'curl-example'
                                )}>
                                    <FaCopy />
                                    {copiedItem === 'curl-example' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre><code>{`curl -X POST ${apiBaseUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "yourpassword"}'`}</code></pre>
                        </div>
                    </div>

                    <div className="auth-card">
                        <div className="auth-card-header">
                            <FaExclamationTriangle />
                            <h3>Token Security</h3>
                        </div>
                        <ul className="security-list">
                            <li><FaCheckCircle /> Tokens expire after 24 hours</li>
                            <li><FaCheckCircle /> Store tokens securely (never in localStorage for production)</li>
                            <li><FaCheckCircle /> Use HTTPS for all API requests</li>
                            <li><FaCheckCircle /> Refresh tokens before expiration</li>
                            <li><FaCheckCircle /> Never share your token with others</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default APIEndpoints;
