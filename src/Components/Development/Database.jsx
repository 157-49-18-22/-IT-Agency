import React, { useState } from 'react';
import {
    FaDatabase,
    FaTable,
    FaKey,
    FaLink,
    FaSearch,
    FaCopy,
    FaChevronDown,
    FaChevronRight,
    FaExclamationTriangle,
    FaCheckCircle,
    FaCode
} from 'react-icons/fa';
import './Database.css';

const Database = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTable, setSelectedTable] = useState(null);
    const [activeTab, setActiveTab] = useState('schema');
    const [copiedItem, setCopiedItem] = useState(null);

    const databaseInfo = {
        name: 'IT_Agency_DB',
        type: 'PostgreSQL',
        version: '15.3',
        host: import.meta.env.VITE_DB_HOST || 'localhost',
        port: '5432'
    };

    const tables = [
        {
            name: 'users',
            description: 'User accounts and authentication data',
            rowCount: 156,
            columns: [
                { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false, description: 'Unique user identifier' },
                { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'User full name' },
                { name: 'email', type: 'VARCHAR(255)', unique: true, nullable: false, description: 'User email address' },
                { name: 'password', type: 'VARCHAR(255)', nullable: false, description: 'Hashed password' },
                { name: 'role', type: 'VARCHAR(50)', nullable: false, description: 'User role (admin, developer, designer, tester, client)' },
                { name: 'is_active', type: 'BOOLEAN', default: 'true', description: 'Account active status' },
                { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Account creation timestamp' },
                { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Last update timestamp' }
            ],
            indexes: [
                { name: 'idx_users_email', columns: ['email'], unique: true },
                { name: 'idx_users_role', columns: ['role'] }
            ],
            relationships: [
                { table: 'projects', type: 'One-to-Many', description: 'User can have multiple projects' },
                { table: 'tasks', type: 'One-to-Many', description: 'User can have multiple tasks' }
            ]
        },
        {
            name: 'projects',
            description: 'Client projects and their details',
            rowCount: 48,
            columns: [
                { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false, description: 'Unique project identifier' },
                { name: 'project_name', type: 'VARCHAR(255)', nullable: false, description: 'Project name' },
                { name: 'description', type: 'TEXT', nullable: true, description: 'Project description' },
                { name: 'client_name', type: 'VARCHAR(255)', nullable: false, description: 'Client company name' },
                { name: 'budget', type: 'DECIMAL(10,2)', nullable: false, description: 'Project budget' },
                { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Project status (pending, approved, in-progress, completed)' },
                { name: 'start_date', type: 'DATE', nullable: false, description: 'Project start date' },
                { name: 'deadline', type: 'DATE', nullable: false, description: 'Project deadline' },
                { name: 'created_by', type: 'INTEGER', foreignKey: 'users(id)', nullable: false, description: 'User who created the project' },
                { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Creation timestamp' },
                { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Last update timestamp' }
            ],
            indexes: [
                { name: 'idx_projects_status', columns: ['status'] },
                { name: 'idx_projects_created_by', columns: ['created_by'] }
            ],
            relationships: [
                { table: 'users', type: 'Many-to-One', description: 'Project belongs to a user' },
                { table: 'tasks', type: 'One-to-Many', description: 'Project has multiple tasks' },
                { table: 'mockups', type: 'One-to-Many', description: 'Project has multiple mockups' }
            ]
        },
        {
            name: 'tasks',
            description: 'Development tasks and assignments',
            rowCount: 324,
            columns: [
                { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false, description: 'Unique task identifier' },
                { name: 'project_id', type: 'INTEGER', foreignKey: 'projects(id)', nullable: false, description: 'Associated project' },
                { name: 'assigned_to', type: 'INTEGER', foreignKey: 'users(id)', nullable: true, description: 'Assigned developer' },
                { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Task title' },
                { name: 'description', type: 'TEXT', nullable: true, description: 'Task description' },
                { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Task status (pending, in-progress, completed)' },
                { name: 'priority', type: 'VARCHAR(20)', nullable: false, description: 'Task priority (low, medium, high, critical)' },
                { name: 'due_date', type: 'DATE', nullable: true, description: 'Task due date' },
                { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Creation timestamp' },
                { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Last update timestamp' }
            ],
            indexes: [
                { name: 'idx_tasks_project_id', columns: ['project_id'] },
                { name: 'idx_tasks_assigned_to', columns: ['assigned_to'] },
                { name: 'idx_tasks_status', columns: ['status'] }
            ],
            relationships: [
                { table: 'projects', type: 'Many-to-One', description: 'Task belongs to a project' },
                { table: 'users', type: 'Many-to-One', description: 'Task assigned to a user' }
            ]
        },
        {
            name: 'mockups',
            description: 'UI/UX design mockups and assets',
            rowCount: 89,
            columns: [
                { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false, description: 'Unique mockup identifier' },
                { name: 'project_id', type: 'INTEGER', foreignKey: 'projects(id)', nullable: false, description: 'Associated project' },
                { name: 'designer_id', type: 'INTEGER', foreignKey: 'users(id)', nullable: false, description: 'Designer who created mockup' },
                { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Mockup title' },
                { name: 'file_url', type: 'VARCHAR(500)', nullable: false, description: 'File storage URL' },
                { name: 'version', type: 'INTEGER', default: '1', description: 'Mockup version number' },
                { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Approval status' },
                { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Creation timestamp' },
                { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Last update timestamp' }
            ],
            indexes: [
                { name: 'idx_mockups_project_id', columns: ['project_id'] },
                { name: 'idx_mockups_designer_id', columns: ['designer_id'] }
            ],
            relationships: [
                { table: 'projects', type: 'Many-to-One', description: 'Mockup belongs to a project' },
                { table: 'users', type: 'Many-to-One', description: 'Mockup created by designer' }
            ]
        },
        {
            name: 'code_files',
            description: 'Code submissions and reviews',
            rowCount: 267,
            columns: [
                { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false, description: 'Unique code file identifier' },
                { name: 'project_id', type: 'INTEGER', foreignKey: 'projects(id)', nullable: false, description: 'Associated project' },
                { name: 'developer_id', type: 'INTEGER', foreignKey: 'users(id)', nullable: false, description: 'Developer who submitted code' },
                { name: 'file_name', type: 'VARCHAR(255)', nullable: false, description: 'Code file name' },
                { name: 'file_path', type: 'VARCHAR(500)', nullable: false, description: 'File storage path' },
                { name: 'language', type: 'VARCHAR(50)', nullable: false, description: 'Programming language' },
                { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Review status' },
                { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Submission timestamp' },
                { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Last update timestamp' }
            ],
            indexes: [
                { name: 'idx_code_files_project_id', columns: ['project_id'] },
                { name: 'idx_code_files_developer_id', columns: ['developer_id'] }
            ],
            relationships: [
                { table: 'projects', type: 'Many-to-One', description: 'Code file belongs to a project' },
                { table: 'users', type: 'Many-to-One', description: 'Code file submitted by developer' }
            ]
        },
        {
            name: 'test_cases',
            description: 'Test cases and results',
            rowCount: 412,
            columns: [
                { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false, description: 'Unique test case identifier' },
                { name: 'project_id', type: 'INTEGER', foreignKey: 'projects(id)', nullable: false, description: 'Associated project' },
                { name: 'tester_id', type: 'INTEGER', foreignKey: 'users(id)', nullable: false, description: 'Tester who created test case' },
                { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Test case title' },
                { name: 'description', type: 'TEXT', nullable: true, description: 'Test case description' },
                { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Test status (passed, failed, pending)' },
                { name: 'priority', type: 'VARCHAR(20)', nullable: false, description: 'Test priority' },
                { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Creation timestamp' },
                { name: 'updated_at', type: 'TIMESTAMP', default: 'NOW()', description: 'Last update timestamp' }
            ],
            indexes: [
                { name: 'idx_test_cases_project_id', columns: ['project_id'] },
                { name: 'idx_test_cases_tester_id', columns: ['tester_id'] }
            ],
            relationships: [
                { table: 'projects', type: 'Many-to-One', description: 'Test case belongs to a project' },
                { table: 'users', type: 'Many-to-One', description: 'Test case created by tester' }
            ]
        }
    ];

    const filteredTables = tables.filter(table =>
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(id);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const generateCreateTableSQL = (table) => {
        let sql = `CREATE TABLE ${table.name} (\n`;

        table.columns.forEach((col, idx) => {
            sql += `  ${col.name} ${col.type}`;
            if (col.primaryKey) sql += ' PRIMARY KEY';
            if (col.unique) sql += ' UNIQUE';
            if (!col.nullable) sql += ' NOT NULL';
            if (col.default) sql += ` DEFAULT ${col.default}`;
            if (idx < table.columns.length - 1) sql += ',';
            sql += '\n';
        });

        sql += ');';
        return sql;
    };

    return (
        <div className="database-container">
            <div className="database-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaDatabase />
                    </div>
                    <div className="header-text">
                        <h1>Database Schema</h1>
                        <p>Complete database structure and relationships</p>
                    </div>
                </div>

                <div className="database-info-grid">
                    <div className="info-item">
                        <span className="info-label">Database:</span>
                        <span className="info-value">{databaseInfo.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Type:</span>
                        <span className="info-value">{databaseInfo.type}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Version:</span>
                        <span className="info-value">{databaseInfo.version}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Host:</span>
                        <span className="info-value">{databaseInfo.host}:{databaseInfo.port}</span>
                    </div>
                </div>
            </div>

            <div className="database-tabs">
                <button
                    className={`db-tab ${activeTab === 'schema' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schema')}
                >
                    <FaTable /> Schema
                </button>
                <button
                    className={`db-tab ${activeTab === 'relationships' ? 'active' : ''}`}
                    onClick={() => setActiveTab('relationships')}
                >
                    <FaLink /> Relationships
                </button>
                <button
                    className={`db-tab ${activeTab === 'queries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('queries')}
                >
                    <FaCode /> Sample Queries
                </button>
            </div>

            {activeTab === 'schema' && (
                <>
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="tables-grid">
                        {filteredTables.map(table => (
                            <div key={table.name} className="table-card">
                                <div
                                    className="table-header"
                                    onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                                >
                                    <div className="table-info">
                                        <FaTable className="table-icon" />
                                        <div>
                                            <h3>{table.name}</h3>
                                            <p>{table.description}</p>
                                        </div>
                                    </div>
                                    <div className="table-meta">
                                        <span className="row-count">{table.rowCount} rows</span>
                                        {selectedTable === table.name ? <FaChevronDown /> : <FaChevronRight />}
                                    </div>
                                </div>

                                {selectedTable === table.name && (
                                    <div className="table-details">
                                        <div className="columns-section">
                                            <h4><FaKey /> Columns</h4>
                                            <div className="columns-table">
                                                <div className="columns-header">
                                                    <span>Name</span>
                                                    <span>Type</span>
                                                    <span>Constraints</span>
                                                    <span>Description</span>
                                                </div>
                                                {table.columns.map(col => (
                                                    <div key={col.name} className="column-row">
                                                        <span className="column-name">
                                                            {col.name}
                                                            {col.primaryKey && <FaKey className="pk-icon" title="Primary Key" />}
                                                        </span>
                                                        <span className="column-type">{col.type}</span>
                                                        <span className="column-constraints">
                                                            {!col.nullable && <span className="constraint">NOT NULL</span>}
                                                            {col.unique && <span className="constraint">UNIQUE</span>}
                                                            {col.default && <span className="constraint">DEFAULT</span>}
                                                            {col.foreignKey && <span className="constraint fk">FK</span>}
                                                        </span>
                                                        <span className="column-description">{col.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {table.indexes && table.indexes.length > 0 && (
                                            <div className="indexes-section">
                                                <h4>Indexes</h4>
                                                <div className="indexes-list">
                                                    {table.indexes.map((index, idx) => (
                                                        <div key={idx} className="index-item">
                                                            <span className="index-name">{index.name}</span>
                                                            <span className="index-columns">({index.columns.join(', ')})</span>
                                                            {index.unique && <span className="unique-badge">UNIQUE</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="sql-section">
                                            <div className="sql-header">
                                                <h4>CREATE TABLE Statement</h4>
                                                <button onClick={() => copyToClipboard(generateCreateTableSQL(table), `sql-${table.name}`)}>
                                                    <FaCopy />
                                                    {copiedItem === `sql-${table.name}` ? 'Copied!' : 'Copy SQL'}
                                                </button>
                                            </div>
                                            <div className="code-block">
                                                <pre><code>{generateCreateTableSQL(table)}</code></pre>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'relationships' && (
                <div className="relationships-view">
                    <div className="relationships-diagram">
                        <h3>Database Relationships</h3>
                        <div className="relationships-list">
                            {tables.map(table => (
                                table.relationships && table.relationships.length > 0 && (
                                    <div key={table.name} className="relationship-group">
                                        <h4><FaTable /> {table.name}</h4>
                                        <div className="relationships">
                                            {table.relationships.map((rel, idx) => (
                                                <div key={idx} className="relationship-item">
                                                    <FaLink className="rel-icon" />
                                                    <span className="rel-type">{rel.type}</span>
                                                    <span className="rel-arrow">→</span>
                                                    <span className="rel-table">{rel.table}</span>
                                                    <span className="rel-description">{rel.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'queries' && (
                <div className="queries-view">
                    <div className="query-examples">
                        <div className="query-card">
                            <h3>Get All Active Projects</h3>
                            <div className="code-block">
                                <div className="code-header">
                                    <span>SQL</span>
                                    <button onClick={() => copyToClipboard("SELECT * FROM projects WHERE status = 'in-progress' ORDER BY created_at DESC;", 'query-1')}>
                                        <FaCopy />
                                        {copiedItem === 'query-1' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre><code>SELECT * FROM projects WHERE status = 'in-progress' ORDER BY created_at DESC;</code></pre>
                            </div>
                        </div>

                        <div className="query-card">
                            <h3>Get User with Their Tasks</h3>
                            <div className="code-block">
                                <div className="code-header">
                                    <span>SQL</span>
                                    <button onClick={() => copyToClipboard("SELECT u.name, t.title, t.status FROM users u LEFT JOIN tasks t ON u.id = t.assigned_to WHERE u.id = 1;", 'query-2')}>
                                        <FaCopy />
                                        {copiedItem === 'query-2' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre><code>SELECT u.name, t.title, t.status FROM users u LEFT JOIN tasks t ON u.id = t.assigned_to WHERE u.id = 1;</code></pre>
                            </div>
                        </div>

                        <div className="query-card">
                            <h3>Project Statistics</h3>
                            <div className="code-block">
                                <div className="code-header">
                                    <span>SQL</span>
                                    <button onClick={() => copyToClipboard("SELECT p.project_name, COUNT(t.id) as task_count, COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id GROUP BY p.id, p.project_name;", 'query-3')}>
                                        <FaCopy />
                                        {copiedItem === 'query-3' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre><code>{`SELECT p.project_name, COUNT(t.id) as task_count, COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id GROUP BY p.id, p.project_name;`}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Database;
