import React, { useState } from 'react';
import {
    FaPlug,
    FaGithub,
    FaSlack,
    FaJira,
    FaTrello,
    FaGoogle,
    FaAws,
    FaDocker,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCopy,
    FaKey,
    FaCode,
    FaLink,
    FaCog,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';
import { SiVercel, SiNetlify, SiHeroku, SiFirebase, SiMongodb, SiPostgresql, SiStripe } from 'react-icons/si';
import './Integrations.css';

const Integrations = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedIntegration, setExpandedIntegration] = useState(null);
    const [copiedItem, setCopiedItem] = useState(null);

    const integrations = [
        {
            id: 'github',
            name: 'GitHub',
            category: 'Version Control',
            icon: <FaGithub />,
            status: 'active',
            description: 'Version control and code repository management',
            features: [
                'Automatic code commits tracking',
                'Pull request notifications',
                'Branch management',
                'Code review integration'
            ],
            setupSteps: [
                'Generate a GitHub Personal Access Token',
                'Add token to environment variables',
                'Configure webhook URL in repository settings',
                'Test connection'
            ],
            envVars: {
                GITHUB_TOKEN: 'your_github_personal_access_token',
                GITHUB_WEBHOOK_SECRET: 'your_webhook_secret'
            },
            apiEndpoint: 'https://api.github.com',
            documentation: 'https://docs.github.com/en/rest'
        },
        {
            id: 'slack',
            name: 'Slack',
            category: 'Communication',
            icon: <FaSlack />,
            status: 'active',
            description: 'Team communication and notifications',
            features: [
                'Real-time project updates',
                'Task assignment notifications',
                'Code review alerts',
                'Daily standup reminders'
            ],
            setupSteps: [
                'Create a Slack App in your workspace',
                'Enable Incoming Webhooks',
                'Copy the Webhook URL',
                'Add URL to environment variables'
            ],
            envVars: {
                SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
                SLACK_CHANNEL: '#development'
            },
            apiEndpoint: 'https://slack.com/api',
            documentation: 'https://api.slack.com/docs'
        },
        {
            id: 'jira',
            name: 'Jira',
            category: 'Project Management',
            icon: <FaJira />,
            status: 'configured',
            description: 'Issue tracking and project management',
            features: [
                'Sync tasks with Jira issues',
                'Automatic status updates',
                'Sprint planning integration',
                'Time tracking'
            ],
            setupSteps: [
                'Create Jira API token',
                'Configure Jira site URL',
                'Set up project key mapping',
                'Enable webhook notifications'
            ],
            envVars: {
                JIRA_HOST: 'your-domain.atlassian.net',
                JIRA_EMAIL: 'your-email@example.com',
                JIRA_API_TOKEN: 'your_jira_api_token',
                JIRA_PROJECT_KEY: 'PROJ'
            },
            apiEndpoint: 'https://your-domain.atlassian.net/rest/api/3',
            documentation: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/'
        },
        {
            id: 'aws',
            name: 'AWS S3',
            category: 'Cloud Storage',
            icon: <FaAws />,
            status: 'active',
            description: 'Cloud storage for files and assets',
            features: [
                'Secure file uploads',
                'CDN integration',
                'Automatic backups',
                'Version control for assets'
            ],
            setupSteps: [
                'Create AWS S3 bucket',
                'Configure IAM user with S3 permissions',
                'Generate access keys',
                'Set up CORS policy'
            ],
            envVars: {
                AWS_ACCESS_KEY_ID: 'your_aws_access_key',
                AWS_SECRET_ACCESS_KEY: 'your_aws_secret_key',
                AWS_REGION: 'us-east-1',
                AWS_S3_BUCKET: 'your-bucket-name'
            },
            apiEndpoint: 'https://s3.amazonaws.com',
            documentation: 'https://docs.aws.amazon.com/s3/'
        },
        {
            id: 'vercel',
            name: 'Vercel',
            category: 'Deployment',
            icon: <SiVercel />,
            status: 'active',
            description: 'Automatic deployment and hosting',
            features: [
                'Automatic deployments from Git',
                'Preview deployments for PRs',
                'Custom domains',
                'Analytics and monitoring'
            ],
            setupSteps: [
                'Connect GitHub repository',
                'Configure build settings',
                'Set environment variables',
                'Deploy'
            ],
            envVars: {
                VERCEL_TOKEN: 'your_vercel_token',
                VERCEL_PROJECT_ID: 'your_project_id',
                VERCEL_ORG_ID: 'your_org_id'
            },
            apiEndpoint: 'https://api.vercel.com',
            documentation: 'https://vercel.com/docs'
        },
        {
            id: 'firebase',
            name: 'Firebase',
            category: 'Backend Services',
            icon: <SiFirebase />,
            status: 'configured',
            description: 'Authentication and real-time database',
            features: [
                'User authentication',
                'Real-time database',
                'Cloud messaging',
                'Analytics'
            ],
            setupSteps: [
                'Create Firebase project',
                'Enable Authentication methods',
                'Get Firebase config',
                'Initialize Firebase in app'
            ],
            envVars: {
                FIREBASE_API_KEY: 'your_firebase_api_key',
                FIREBASE_AUTH_DOMAIN: 'your-project.firebaseapp.com',
                FIREBASE_PROJECT_ID: 'your-project-id',
                FIREBASE_STORAGE_BUCKET: 'your-project.appspot.com'
            },
            apiEndpoint: 'https://firebase.google.com',
            documentation: 'https://firebase.google.com/docs'
        },
        {
            id: 'stripe',
            name: 'Stripe',
            category: 'Payment',
            icon: <SiStripe />,
            status: 'inactive',
            description: 'Payment processing and billing',
            features: [
                'Secure payment processing',
                'Subscription management',
                'Invoice generation',
                'Payment analytics'
            ],
            setupSteps: [
                'Create Stripe account',
                'Get API keys',
                'Configure webhook endpoints',
                'Test with test mode keys'
            ],
            envVars: {
                STRIPE_PUBLIC_KEY: 'pk_test_your_public_key',
                STRIPE_SECRET_KEY: 'sk_test_your_secret_key',
                STRIPE_WEBHOOK_SECRET: 'whsec_your_webhook_secret'
            },
            apiEndpoint: 'https://api.stripe.com',
            documentation: 'https://stripe.com/docs/api'
        },
        {
            id: 'docker',
            name: 'Docker',
            category: 'DevOps',
            icon: <FaDocker />,
            status: 'active',
            description: 'Containerization and deployment',
            features: [
                'Container orchestration',
                'Environment consistency',
                'Easy scaling',
                'CI/CD integration'
            ],
            setupSteps: [
                'Install Docker',
                'Create Dockerfile',
                'Build Docker image',
                'Run container'
            ],
            envVars: {
                DOCKER_REGISTRY: 'docker.io',
                DOCKER_USERNAME: 'your_username',
                DOCKER_PASSWORD: 'your_password'
            },
            apiEndpoint: 'https://hub.docker.com',
            documentation: 'https://docs.docker.com'
        },
        {
            id: 'postgresql',
            name: 'PostgreSQL',
            category: 'Database',
            icon: <SiPostgresql />,
            status: 'active',
            description: 'Primary database system',
            features: [
                'Relational database',
                'ACID compliance',
                'Advanced querying',
                'Data integrity'
            ],
            setupSteps: [
                'Install PostgreSQL',
                'Create database',
                'Configure connection',
                'Run migrations'
            ],
            envVars: {
                DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname',
                DB_HOST: 'localhost',
                DB_PORT: '5432',
                DB_NAME: 'it_agency_db'
            },
            apiEndpoint: 'postgresql://localhost:5432',
            documentation: 'https://www.postgresql.org/docs/'
        }
    ];

    const categories = ['all', ...new Set(integrations.map(i => i.category))];

    const filteredIntegrations = activeCategory === 'all'
        ? integrations
        : integrations.filter(i => i.category === activeCategory);

    const getStatusColor = (status) => {
        const colors = {
            active: '#10b981',
            configured: '#f59e0b',
            inactive: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: 'Active',
            configured: 'Configured',
            inactive: 'Not Active'
        };
        return labels[status] || status;
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(id);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const generateEnvExample = (envVars) => {
        return Object.entries(envVars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    };

    return (
        <div className="integrations-container">
            <div className="integrations-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaPlug />
                    </div>
                    <div className="header-text">
                        <h1>Integrations</h1>
                        <p>Third-party services and tools integrated with the platform</p>
                    </div>
                </div>

                <div className="integrations-stats">
                    <div className="stat-card">
                        <div className="stat-value">{integrations.filter(i => i.status === 'active').length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{integrations.filter(i => i.status === 'configured').length}</div>
                        <div className="stat-label">Configured</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{integrations.length}</div>
                        <div className="stat-label">Total</div>
                    </div>
                </div>
            </div>

            <div className="category-filters">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-filter ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category === 'all' ? 'All Integrations' : category}
                    </button>
                ))}
            </div>

            <div className="integrations-grid">
                {filteredIntegrations.map(integration => (
                    <div key={integration.id} className="integration-card">
                        <div
                            className="integration-header"
                            onClick={() => setExpandedIntegration(
                                expandedIntegration === integration.id ? null : integration.id
                            )}
                        >
                            <div className="integration-info">
                                <div className="integration-icon" style={{ color: getStatusColor(integration.status) }}>
                                    {integration.icon}
                                </div>
                                <div className="integration-details">
                                    <h3>{integration.name}</h3>
                                    <p>{integration.description}</p>
                                </div>
                            </div>
                            <div className="integration-meta">
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: `${getStatusColor(integration.status)}20`,
                                        borderColor: getStatusColor(integration.status),
                                        color: getStatusColor(integration.status)
                                    }}
                                >
                                    {getStatusLabel(integration.status)}
                                </span>
                                {expandedIntegration === integration.id ? <FaChevronDown /> : <FaChevronRight />}
                            </div>
                        </div>

                        {expandedIntegration === integration.id && (
                            <div className="integration-expanded">
                                <div className="features-section">
                                    <h4><FaCheckCircle /> Features</h4>
                                    <ul className="features-list">
                                        {integration.features.map((feature, idx) => (
                                            <li key={idx}>
                                                <FaCheckCircle />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="setup-section">
                                    <h4><FaCog /> Setup Steps</h4>
                                    <ol className="setup-steps">
                                        {integration.setupSteps.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="env-section">
                                    <div className="env-header">
                                        <h4><FaKey /> Environment Variables</h4>
                                        <button
                                            onClick={() => copyToClipboard(
                                                generateEnvExample(integration.envVars),
                                                `env-${integration.id}`
                                            )}
                                        >
                                            <FaCopy />
                                            {copiedItem === `env-${integration.id}` ? 'Copied!' : 'Copy All'}
                                        </button>
                                    </div>
                                    <div className="code-block">
                                        <pre><code>{generateEnvExample(integration.envVars)}</code></pre>
                                    </div>
                                </div>

                                <div className="api-section">
                                    <h4><FaCode /> API Information</h4>
                                    <div className="api-info">
                                        <div className="api-item">
                                            <span className="api-label">Endpoint:</span>
                                            <code>{integration.apiEndpoint}</code>
                                            <button onClick={() => copyToClipboard(integration.apiEndpoint, `api-${integration.id}`)}>
                                                <FaCopy />
                                            </button>
                                        </div>
                                        <div className="api-item">
                                            <span className="api-label">Documentation:</span>
                                            <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                                                <FaLink /> View Docs
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Integrations;
