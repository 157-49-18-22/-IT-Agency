import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaCode, FaDatabase, FaServer, FaTerminal } from 'react-icons/fa';
import { environmentAPI } from '../../services/api';
import './TaskPages.css';
import './TaskPagesExtended.css';

const EnvironmentSetup = () => {
    const [envData, setEnvData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [setupSteps, setSetupSteps] = useState([
        {
            id: 1,
            title: 'Install Node.js',
            description: 'Download and install Node.js v18+ from nodejs.org',
            command: 'node --version',
            completed: false
        },
        {
            id: 2,
            title: 'Install MySQL',
            description: 'Install MySQL 8.0+ and create database',
            command: 'mysql --version',
            completed: false
        },
        {
            id: 3,
            title: 'Clone Repository',
            description: 'Clone the project repository from GitHub',
            command: 'git clone <repository-url>',
            completed: true // Assumed true if running
        },
        {
            id: 4,
            title: 'Install Dependencies',
            description: 'Install npm packages for frontend and backend',
            command: 'npm install',
            completed: true // Assumed true if running
        },
        {
            id: 5,
            title: 'Configure Environment',
            description: 'Set up .env files with database credentials',
            command: 'cp .env.example .env',
            completed: true // Assumed true if running
        },
        {
            id: 6,
            title: 'Run Migrations',
            description: 'Set up database tables and seed data',
            command: 'npm run migrate',
            completed: false
        },
        {
            id: 7,
            title: 'Start Development Server',
            description: 'Run frontend and backend servers',
            command: 'npm run dev',
            completed: true // We are here
        }
    ]);

    useEffect(() => {
        const fetchEnvData = async () => {
            try {
                const response = await environmentAPI.getEnvironmentInfo();
                const data = response.data;
                setEnvData(data);

                // Update steps based on data
                setSetupSteps(prevSteps => prevSteps.map(step => {
                    if (step.id === 1 && data.system && data.system.nodeVersion) return { ...step, completed: true, command: `node ${data.system.nodeVersion}` };
                    if (step.id === 2 && data.database && data.database.connected) return { ...step, completed: true, command: `mysql (${data.database.version})` };
                    if (step.id === 6 && data.database && data.database.connected) return { ...step, completed: true };
                    return step;
                }));
            } catch (error) {
                console.error('Failed to fetch environment data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnvData();
    }, []);

    return (
        <div className="task-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Environment Setup</h1>
                    <p>Complete development environment configuration guide</p>
                </div>
            </div>

            <div className="setup-content">
                <div className="setup-checklist">
                    {setupSteps.map((step) => (
                        <div key={step.id} className={`setup-step ${step.completed ? 'completed' : ''}`}>
                            <div className="step-header">
                                <div className="step-number">{step.id}</div>
                                <div className="step-info">
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                                {step.completed && <FaCheckCircle className="step-check" />}
                            </div>
                            <div className="step-command">
                                <FaTerminal />
                                <code>{step.command}</code>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="setup-sidebar">
                    <div className="info-card">
                        <h3><FaCode /> Tech Stack</h3>
                        <ul>
                            <li>React 18+</li>
                            <li>Node.js {envData?.system?.nodeVersion || '18+'}</li>
                            <li>MySQL {envData?.database?.version ? envData.database.version.split('-')[0] : '8.0+'}</li>
                            <li>Express.js</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3><FaDatabase /> Database</h3>
                        <p>Status: {envData?.database?.connected ? <span style={{ color: '#4ade80' }}>Connected</span> : 'Disconnected'}</p>
                        <p>Version: {envData?.database?.version || 'Unknown'}</p>
                        <p>Type: {envData?.database?.type || 'MySQL'}</p>
                    </div>

                    <div className="info-card">
                        <h3><FaServer /> Server System</h3>
                        {envData ? (
                            <>
                                <p>OS: {envData.system.platform} {envData.system.release}</p>
                                <p>Arch: {envData.system.architecture}</p>
                                <p>CPUs: {envData.system.cpus}</p>
                                <p>Uptime: {Math.floor(envData.system.uptime / 60)} mins</p>
                                <p>Memory: {Math.round((envData.system.totalMemory - envData.system.freeMemory) / (1024 * 1024))}MB / {Math.round(envData.system.totalMemory / (1024 * 1024))}MB</p>
                            </>
                        ) : (
                            <p>Loading system info...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentSetup;
