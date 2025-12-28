import React, { useState, useEffect } from 'react';
import {
    FaBook,
    FaCheckCircle,
    FaCode,
    FaFileCode,
    FaLightbulb,
    FaExclamationTriangle,
    FaSearch,
    FaCopy,
    FaChevronDown,
    FaChevronRight,
    FaHeartbeat,
    FaChartLine,
    FaShieldAlt
} from 'react-icons/fa';
import { codingAPI } from '../../services/api';
import './CodingStandards.css';

const CodingStandards = () => {
    const [activeCategory, setActiveCategory] = useState('naming');
    const [expandedSections, setExpandedSections] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await codingAPI.getStats();
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch coding stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const categories = [
        { id: 'naming', name: 'Naming Conventions', icon: <FaFileCode /> },
        { id: 'structure', name: 'Code Structure', icon: <FaCode /> },
        { id: 'best-practices', name: 'Best Practices', icon: <FaLightbulb /> },
        { id: 'security', name: 'Security Guidelines', icon: <FaExclamationTriangle /> },
        { id: 'documentation', name: 'Documentation', icon: <FaBook /> },
    ];

    const standards = {
        naming: {
            title: 'Naming Conventions',
            description: 'Follow these naming conventions for consistent and readable code',
            rules: [
                {
                    title: 'Variables & Functions',
                    expanded: true,
                    items: [
                        {
                            rule: 'Use camelCase for variables and functions',
                            good: `const userName = 'John Doe';\nfunction getUserData() { }`,
                            bad: `const user_name = 'John Doe';\nfunction get_user_data() { }`,
                            explanation: 'CamelCase improves readability and follows JavaScript conventions'
                        },
                        {
                            rule: 'Use descriptive names that explain purpose',
                            good: `const isUserAuthenticated = true;\nconst totalOrderAmount = 1500;`,
                            bad: `const flag = true;\nconst tot = 1500;`,
                            explanation: 'Descriptive names make code self-documenting'
                        },
                        {
                            rule: 'Boolean variables should start with is/has/can',
                            good: `const isActive = true;\nconst hasPermission = false;\nconst canEdit = true;`,
                            bad: `const active = true;\nconst permission = false;\nconst edit = true;`,
                            explanation: 'Prefix makes boolean nature immediately clear'
                        }
                    ]
                },
                {
                    title: 'Classes & Components',
                    items: [
                        {
                            rule: 'Use PascalCase for classes and React components',
                            good: `class UserProfile { }\nfunction UserDashboard() { }`,
                            bad: `class userProfile { }\nfunction user_dashboard() { }`,
                            explanation: 'PascalCase distinguishes components from regular functions'
                        },
                        {
                            rule: 'Component files should match component name',
                            good: `// UserProfile.jsx\nexport default UserProfile;`,
                            bad: `// profile.jsx\nexport default UserProfile;`,
                            explanation: 'Makes components easy to locate in the file system'
                        }
                    ]
                },
                {
                    title: 'Constants & Enums',
                    items: [
                        {
                            rule: 'Use UPPER_SNAKE_CASE for constants',
                            good: `const MAX_RETRY_COUNT = 3;\nconst API_BASE_URL = 'https://api.example.com';`,
                            bad: `const maxRetryCount = 3;\nconst apiBaseUrl = 'https://api.example.com';`,
                            explanation: 'Uppercase clearly identifies unchanging values'
                        },
                        {
                            rule: 'Group related constants in objects',
                            good: `const STATUS = {\n  PENDING: 'pending',\n  APPROVED: 'approved',\n  REJECTED: 'rejected'\n};`,
                            bad: `const STATUS_PENDING = 'pending';\nconst STATUS_APPROVED = 'approved';\nconst STATUS_REJECTED = 'rejected';`,
                            explanation: 'Namespacing prevents conflicts and improves organization'
                        }
                    ]
                }
            ]
        },
        structure: {
            title: 'Code Structure',
            description: 'Organize your code for maximum maintainability',
            rules: [
                {
                    title: 'File Organization',
                    items: [
                        {
                            rule: 'One component per file',
                            good: `// UserProfile.jsx\nexport default function UserProfile() {\n  return <div>Profile</div>;\n}`,
                            bad: `// components.jsx\nfunction UserProfile() { }\nfunction UserSettings() { }\nfunction UserDashboard() { }`,
                            explanation: 'Easier to locate and maintain individual components'
                        },
                        {
                            rule: 'Group imports by type',
                            good: `// React imports\nimport React, { useState } from 'react';\n\n// Third-party imports\nimport axios from 'axios';\nimport { Button } from '@mui/material';\n\n// Local imports\nimport './styles.css';\nimport { api } from './api';`,
                            bad: `import { Button } from '@mui/material';\nimport React from 'react';\nimport './styles.css';\nimport axios from 'axios';`,
                            explanation: 'Organized imports are easier to scan and maintain'
                        }
                    ]
                },
                {
                    title: 'Function Structure',
                    items: [
                        {
                            rule: 'Keep functions small and focused',
                            good: `function validateEmail(email) {\n  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return regex.test(email);\n}\n\nfunction validateForm(data) {\n  return validateEmail(data.email) && data.password.length >= 8;\n}`,
                            bad: `function validateForm(data) {\n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  if (!emailRegex.test(data.email)) return false;\n  if (data.password.length < 8) return false;\n  // ... 50 more lines\n  return true;\n}`,
                            explanation: 'Small functions are easier to test and reuse'
                        },
                        {
                            rule: 'Use early returns to reduce nesting',
                            good: `function processUser(user) {\n  if (!user) return null;\n  if (!user.isActive) return null;\n  \n  return user.data;\n}`,
                            bad: `function processUser(user) {\n  if (user) {\n    if (user.isActive) {\n      return user.data;\n    }\n  }\n  return null;\n}`,
                            explanation: 'Reduces cognitive load and improves readability'
                        }
                    ]
                },
                {
                    title: 'Component Structure',
                    items: [
                        {
                            rule: 'Follow consistent component order',
                            good: `function MyComponent() {\n  // 1. Hooks\n  const [state, setState] = useState();\n  \n  // 2. Effects\n  useEffect(() => { }, []);\n  \n  // 3. Event handlers\n  const handleClick = () => { };\n  \n  // 4. Render helpers\n  const renderItem = () => { };\n  \n  // 5. Return JSX\n  return <div>...</div>;\n}`,
                            bad: `function MyComponent() {\n  const handleClick = () => { };\n  const [state, setState] = useState();\n  const renderItem = () => { };\n  useEffect(() => { }, []);\n  return <div>...</div>;\n}`,
                            explanation: 'Consistent structure makes components predictable'
                        }
                    ]
                }
            ]
        },
        'best-practices': {
            title: 'Best Practices',
            description: 'Write clean, efficient, and maintainable code',
            rules: [
                {
                    title: 'Error Handling',
                    items: [
                        {
                            rule: 'Always handle errors in async operations',
                            good: `async function fetchData() {\n  try {\n    const response = await api.get('/data');\n    return response.data;\n  } catch (error) {\n    console.error('Failed to fetch data:', error);\n    throw error;\n  }\n}`,
                            bad: `async function fetchData() {\n  const response = await api.get('/data');\n  return response.data;\n}`,
                            explanation: 'Prevents unhandled promise rejections and improves debugging'
                        },
                        {
                            rule: 'Provide meaningful error messages',
                            good: `if (!user.email) {\n  throw new Error('User email is required for registration');\n}`,
                            bad: `if (!user.email) {\n  throw new Error('Invalid input');\n}`,
                            explanation: 'Specific errors help developers debug faster'
                        }
                    ]
                },
                {
                    title: 'Performance',
                    items: [
                        {
                            rule: 'Use useMemo for expensive calculations',
                            good: `const expensiveValue = useMemo(() => {\n  return complexCalculation(data);\n}, [data]);`,
                            bad: `const expensiveValue = complexCalculation(data);`,
                            explanation: 'Prevents unnecessary recalculations on every render'
                        },
                        {
                            rule: 'Use useCallback for event handlers passed to children',
                            good: `const handleClick = useCallback(() => {\n  setCount(c => c + 1);\n}, []);`,
                            bad: `const handleClick = () => {\n  setCount(count + 1);\n};`,
                            explanation: 'Prevents unnecessary re-renders of child components'
                        }
                    ]
                },
                {
                    title: 'Code Quality',
                    items: [
                        {
                            rule: 'Avoid magic numbers and strings',
                            good: `const MAX_LOGIN_ATTEMPTS = 3;\nif (attempts >= MAX_LOGIN_ATTEMPTS) {\n  lockAccount();\n}`,
                            bad: `if (attempts >= 3) {\n  lockAccount();\n}`,
                            explanation: 'Named constants make code self-documenting'
                        },
                        {
                            rule: 'Use destructuring for cleaner code',
                            good: `const { name, email, role } = user;\nconsole.log(name, email, role);`,
                            bad: `console.log(user.name, user.email, user.role);`,
                            explanation: 'Reduces repetition and improves readability'
                        }
                    ]
                }
            ]
        },
        security: {
            title: 'Security Guidelines',
            description: 'Protect your application and user data',
            rules: [
                {
                    title: 'Input Validation',
                    items: [
                        {
                            rule: 'Always validate and sanitize user input',
                            good: `function processInput(input) {\n  const sanitized = input.trim().replace(/[<>]/g, '');\n  if (sanitized.length < 3 || sanitized.length > 100) {\n    throw new Error('Invalid input length');\n  }\n  return sanitized;\n}`,
                            bad: `function processInput(input) {\n  return input;\n}`,
                            explanation: 'Prevents XSS and injection attacks'
                        },
                        {
                            rule: 'Use parameterized queries for database operations',
                            good: `const query = 'SELECT * FROM users WHERE id = ?';\ndb.query(query, [userId]);`,
                            bad: `const query = \`SELECT * FROM users WHERE id = \${userId}\`;\ndb.query(query);`,
                            explanation: 'Prevents SQL injection attacks'
                        }
                    ]
                },
                {
                    title: 'Authentication & Authorization',
                    items: [
                        {
                            rule: 'Never store sensitive data in localStorage',
                            good: `// Store in httpOnly cookie or secure session\nres.cookie('token', jwt, { httpOnly: true, secure: true });`,
                            bad: `localStorage.setItem('token', jwt);\nlocalStorage.setItem('password', password);`,
                            explanation: 'LocalStorage is vulnerable to XSS attacks'
                        },
                        {
                            rule: 'Always verify user permissions before actions',
                            good: `if (!user.hasPermission('delete')) {\n  throw new Error('Unauthorized');\n}\ndeleteResource(id);`,
                            bad: `deleteResource(id);`,
                            explanation: 'Prevents unauthorized access to protected resources'
                        }
                    ]
                },
                {
                    title: 'Data Protection',
                    items: [
                        {
                            rule: 'Never log sensitive information',
                            good: `console.log('User logged in:', { userId: user.id });`,
                            bad: `console.log('User logged in:', { password: user.password, token: user.token });`,
                            explanation: 'Prevents exposure of sensitive data in logs'
                        },
                        {
                            rule: 'Use environment variables for secrets',
                            good: `const apiKey = process.env.REACT_APP_API_KEY;`,
                            bad: `const apiKey = 'sk_live_abc123xyz456';`,
                            explanation: 'Keeps secrets out of version control'
                        }
                    ]
                }
            ]
        },
        documentation: {
            title: 'Documentation Standards',
            description: 'Document your code for better collaboration',
            rules: [
                {
                    title: 'Code Comments',
                    items: [
                        {
                            rule: 'Write comments that explain "why", not "what"',
                            good: `// Retry failed requests to handle temporary network issues\nconst maxRetries = 3;`,
                            bad: `// Set maxRetries to 3\nconst maxRetries = 3;`,
                            explanation: 'Code shows what it does; comments should explain reasoning'
                        },
                        {
                            rule: 'Use JSDoc for function documentation',
                            good: `/**\n * Calculates the total price including tax\n * @param {number} price - Base price\n * @param {number} taxRate - Tax rate (0-1)\n * @returns {number} Total price with tax\n */\nfunction calculateTotal(price, taxRate) {\n  return price * (1 + taxRate);\n}`,
                            bad: `function calculateTotal(price, taxRate) {\n  return price * (1 + taxRate);\n}`,
                            explanation: 'JSDoc provides type hints and usage information'
                        }
                    ]
                },
                {
                    title: 'Component Documentation',
                    items: [
                        {
                            rule: 'Document component props with PropTypes or TypeScript',
                            good: `/**\n * User profile card component\n * @param {Object} props\n * @param {string} props.name - User's full name\n * @param {string} props.email - User's email\n * @param {string} [props.avatar] - Optional avatar URL\n */\nfunction UserCard({ name, email, avatar }) {\n  return <div>...</div>;\n}`,
                            bad: `function UserCard({ name, email, avatar }) {\n  return <div>...</div>;\n}`,
                            explanation: 'Makes component usage clear to other developers'
                        }
                    ]
                },
                {
                    title: 'README Files',
                    items: [
                        {
                            rule: 'Include setup instructions in README',
                            good: `# Project Name\n\n## Setup\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Environment Variables\n- REACT_APP_API_URL\n- REACT_APP_API_KEY`,
                            bad: `# Project Name\n\nA web application.`,
                            explanation: 'Helps new developers get started quickly'
                        }
                    ]
                }
            ]
        }
    };

    const toggleSection = (categoryId, ruleIndex) => {
        const key = `${categoryId}-${ruleIndex}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const currentStandards = standards[activeCategory];

    return (
        <div className="coding-standards-container">
            <div className="standards-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaBook />
                    </div>
                    <div className="header-text">
                        <h1>Coding Standards</h1>
                        <p>Follow these guidelines to write clean, maintainable, and secure code</p>
                    </div>
                </div>

                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search standards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Project Health Dashboard */}
            {stats && (
                <div className="project-health-dashboard">
                    <div className="health-card">
                        <div className="health-icon warning">
                            <FaHeartbeat />
                        </div>
                        <div className="health-info">
                            <h3>Project Health</h3>
                            <div className="health-score">
                                <span className="score-value">{stats.healthScore}%</span>
                                <span className="score-label">Compliance</span>
                            </div>
                            <div className="progress-bar-small">
                                <div className="fill" style={{ width: `${stats.healthScore}%`, background: stats.healthScore > 80 ? '#4ade80' : '#fbbf24' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="health-card">
                        <div className="health-icon info">
                            <FaChartLine />
                        </div>
                        <div className="health-info">
                            <h3>Code Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-val">{stats.stats.linesOfCode.toLocaleString()}</span>
                                    <span className="stat-lbl">Lines</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-val">{stats.stats.components}</span>
                                    <span className="stat-lbl">Components</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-val">{stats.stats.totalFiles}</span>
                                    <span className="stat-lbl">Files</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="health-card">
                        <div className="health-icon success">
                            <FaShieldAlt />
                        </div>
                        <div className="health-info">
                            <h3>Active Rules</h3>
                            <div className="active-rules-list">
                                {stats.config.eslint && <span className="rule-badge">ESLint</span>}
                                {stats.config.activeRules.includes('no-unused-vars') && <span className="rule-badge">No Unused Vars</span>}
                                {stats.config.activeRules.includes('react-hooks/rules-of-hooks') && <span className="rule-badge">React Hooks</span>}
                                <span className="rule-badge">Strict Mode</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="standards-content">
                <div className="categories-sidebar">
                    <h3>Categories</h3>
                    <div className="category-list">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="standards-main">
                    <div className="standards-intro">
                        <h2>{currentStandards.title}</h2>
                        <p>{currentStandards.description}</p>
                    </div>

                    <div className="rules-container">
                        {currentStandards.rules.map((ruleGroup, groupIndex) => {
                            const sectionKey = `${activeCategory}-${groupIndex}`;
                            const isExpanded = expandedSections[sectionKey] !== false;

                            return (
                                <div key={groupIndex} className="rule-group">
                                    <div
                                        className="rule-group-header"
                                        onClick={() => toggleSection(activeCategory, groupIndex)}
                                    >
                                        <h3>{ruleGroup.title}</h3>
                                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                    </div>

                                    {isExpanded && (
                                        <div className="rule-items">
                                            {ruleGroup.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="rule-item">
                                                    <div className="rule-header">
                                                        <FaCheckCircle className="rule-icon" />
                                                        <h4>{item.rule}</h4>
                                                    </div>

                                                    <p className="rule-explanation">{item.explanation}</p>

                                                    <div className="code-examples">
                                                        <div className="code-example good">
                                                            <div className="example-header">
                                                                <span className="example-label">
                                                                    <FaCheckCircle /> Good
                                                                </span>
                                                                <button
                                                                    className="copy-button"
                                                                    onClick={() => copyCode(item.good, `good-${groupIndex}-${itemIndex}`)}
                                                                >
                                                                    <FaCopy />
                                                                    {copiedCode === `good-${groupIndex}-${itemIndex}` ? ' Copied!' : ' Copy'}
                                                                </button>
                                                            </div>
                                                            <pre><code>{item.good}</code></pre>
                                                        </div>

                                                        <div className="code-example bad">
                                                            <div className="example-header">
                                                                <span className="example-label">
                                                                    <FaExclamationTriangle /> Bad
                                                                </span>
                                                                <button
                                                                    className="copy-button"
                                                                    onClick={() => copyCode(item.bad, `bad-${groupIndex}-${itemIndex}`)}
                                                                >
                                                                    <FaCopy />
                                                                    {copiedCode === `bad-${groupIndex}-${itemIndex}` ? ' Copied!' : ' Copy'}
                                                                </button>
                                                            </div>
                                                            <pre><code>{item.bad}</code></pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingStandards;
