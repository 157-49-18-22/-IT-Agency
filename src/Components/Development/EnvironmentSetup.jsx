import React from 'react';
import { FaCheckCircle, FaCode, FaDatabase, FaServer, FaTerminal } from 'react-icons/fa';
import './TaskPages.css';
import './TaskPagesExtended.css';

const EnvironmentSetup = () => {
    const setupSteps = [
        {
            id: 1,
            title: 'Install Node.js',
            description: 'Download and install Node.js v18+ from nodejs.org',
            command: 'node --version',
            completed: true
        },
        {
            id: 2,
            title: 'Install MySQL',
            description: 'Install MySQL 8.0+ and create database',
            command: 'mysql --version',
            completed: true
        },
        {
            id: 3,
            title: 'Clone Repository',
            description: 'Clone the project repository from GitHub',
            command: 'git clone <repository-url>',
            completed: false
        },
        {
            id: 4,
            title: 'Install Dependencies',
            description: 'Install npm packages for frontend and backend',
            command: 'npm install',
            completed: false
        },
        {
            id: 5,
            title: 'Configure Environment',
            description: 'Set up .env files with database credentials',
            command: 'cp .env.example .env',
            completed: false
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
            completed: false
        }
    ];

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
                            <li>Node.js 18+</li>
                            <li>MySQL 8.0+</li>
                            <li>Express.js</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3><FaDatabase /> Database</h3>
                        <p>Database: it_agency_pms</p>
                        <p>Port: 3306</p>
                    </div>

                    <div className="info-card">
                        <h3><FaServer /> Servers</h3>
                        <p>Frontend: http://localhost:5173</p>
                        <p>Backend: http://localhost:5000</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentSetup;
