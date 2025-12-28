import React, { useState, useEffect } from 'react';
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

import { endpointsAPI } from '../../services/api';

const APIEndpoints = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('all');
    const [expandedEndpoint, setExpandedEndpoint] = useState(null);
    const [copiedItem, setCopiedItem] = useState(null);
    const [activeTab, setActiveTab] = useState('endpoints');
    const [realEndpoints, setRealEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.example.com';

    useEffect(() => {
        const fetchEndpoints = async () => {
            try {
                const response = await endpointsAPI.getAll();
                if (response.data && response.data.success) {
                    setRealEndpoints(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch endpoints:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEndpoints();
    }, []);

    // Fallback/Rich static data to merge descriptions if needed
    const staticEndpoints = [
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
        }
        // ... more static data can be kept if desired for merging in future
    ];

    // Use real endpoints if available, otherwise static (or empty)
    const endpoints = realEndpoints.length > 0 ? realEndpoints : staticEndpoints;


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
