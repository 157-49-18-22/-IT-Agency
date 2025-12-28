import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { versionHistoryAPI } from '../../services/api';
import './VersionHistory.css';

const VersionHistory = () => {
    const { currentUser } = useAuth();
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [compareVersions, setCompareVersions] = useState({ v1: null, v2: null });
    const [filter, setFilter] = useState('all'); // all, major, minor, patch

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const response = await versionHistoryAPI.getAll();
                if (response.data && response.data.success) {
                    setVersions(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch version history:', error);
            }
        };
        fetchVersions();
    }, []);

    const filteredVersions = versions.filter(version => {
        if (filter === 'all') return true;
        return version.type === filter;
    });

    const getVersionBadge = (type) => {
        const badges = {
            major: { class: 'version-major', icon: '🚀', text: 'Major' },
            minor: { class: 'version-minor', icon: '✨', text: 'Minor' },
            patch: { class: 'version-patch', icon: '🔧', text: 'Patch' }
        };
        const badge = badges[type] || badges.patch;
        return (
            <span className={`version-badge ${badge.class}`}>
                <span className="badge-icon">{badge.icon}</span>
                {badge.text}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            deployed: { class: 'status-deployed', icon: '✅', text: 'Deployed' },
            staging: { class: 'status-staging', icon: '⏳', text: 'Staging' },
            development: { class: 'status-development', icon: '🔨', text: 'Development' }
        };
        const badge = badges[status] || badges.development;
        return (
            <span className={`status-badge ${badge.class}`}>
                <span className="badge-icon">{badge.icon}</span>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="version-history-container">
            <div className="version-history-header">
                <div className="header-content">
                    <h1>
                        <span className="icon">📜</span>
                        Version History
                    </h1>
                    <p className="subtitle">Track all releases and changes across versions</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <span className="icon">📥</span>
                        Export History
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <h3>{versions.length}</h3>
                        <p>Total Versions</p>
                    </div>
                </div>
                <div className="stat-card major">
                    <div className="stat-icon">🚀</div>
                    <div className="stat-content">
                        <h3>{versions.filter(v => v.type === 'major').length}</h3>
                        <p>Major Releases</p>
                    </div>
                </div>
                <div className="stat-card minor">
                    <div className="stat-icon">✨</div>
                    <div className="stat-content">
                        <h3>{versions.filter(v => v.type === 'minor').length}</h3>
                        <p>Minor Releases</p>
                    </div>
                </div>
                <div className="stat-card patch">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-content">
                        <h3>{versions.filter(v => v.type === 'patch').length}</h3>
                        <p>Patches</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Versions
                    </button>
                    <button
                        className={`filter-tab ${filter === 'major' ? 'active' : ''}`}
                        onClick={() => setFilter('major')}
                    >
                        🚀 Major
                    </button>
                    <button
                        className={`filter-tab ${filter === 'minor' ? 'active' : ''}`}
                        onClick={() => setFilter('minor')}
                    >
                        ✨ Minor
                    </button>
                    <button
                        className={`filter-tab ${filter === 'patch' ? 'active' : ''}`}
                        onClick={() => setFilter('patch')}
                    >
                        🔧 Patch
                    </button>
                </div>
            </div>

            {/* Version Timeline */}
            <div className="version-timeline">
                {filteredVersions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No versions found</h3>
                        <p>There are no versions matching your filter criteria.</p>
                    </div>
                ) : (
                    filteredVersions.map((version, index) => (
                        <div key={version.id} className="timeline-item">
                            <div className="timeline-marker">
                                <div className={`marker-dot ${version.type}`}></div>
                                {index < filteredVersions.length - 1 && <div className="marker-line"></div>}
                            </div>

                            <div className="version-card">
                                <div className="version-header">
                                    <div className="version-title-section">
                                        <div className="version-number">
                                            <h2>v{version.version}</h2>
                                            <div className="version-badges">
                                                {getVersionBadge(version.type)}
                                                {getStatusBadge(version.status)}
                                            </div>
                                        </div>
                                        <h3>{version.title}</h3>
                                    </div>

                                    <div className="version-meta">
                                        <div className="meta-item">
                                            <span className="icon">👤</span>
                                            <span>{version.author}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="icon">📅</span>
                                            <span>{version.date}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="icon">🕐</span>
                                            <span>{version.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="version-description">{version.description}</p>

                                <div className="version-stats">
                                    <div className="stat-item">
                                        <span className="icon">📁</span>
                                        <span>{version.filesChanged} files</span>
                                    </div>
                                    <div className="stat-item success">
                                        <span className="icon">➕</span>
                                        <span>{version.additions} additions</span>
                                    </div>
                                    <div className="stat-item danger">
                                        <span className="icon">➖</span>
                                        <span>{version.deletions} deletions</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="icon">🔀</span>
                                        <span>{version.branch}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="icon">🔖</span>
                                        <code>{version.commitHash}</code>
                                    </div>
                                </div>

                                <div className="changes-section">
                                    <h4>
                                        <span className="icon">📝</span>
                                        Changes
                                    </h4>
                                    <ul className="changes-list">
                                        {version.changes.map((change, idx) => (
                                            <li key={idx}>{change}</li>
                                        ))}
                                    </ul>
                                </div>

                                {version.deployedTo && (
                                    <div className="deployment-info">
                                        <span className="icon">🌐</span>
                                        <span>Deployed to: <strong>{version.deployedTo}</strong></span>
                                    </div>
                                )}

                                <div className="version-actions">
                                    <button className="btn-secondary">
                                        <span className="icon">👁️</span>
                                        View Details
                                    </button>
                                    <button className="btn-secondary">
                                        <span className="icon">📥</span>
                                        Download
                                    </button>
                                    <button className="btn-secondary">
                                        <span className="icon">🔄</span>
                                        Rollback
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setCompareVersions({ ...compareVersions, v1: version });
                                            setShowCompareModal(true);
                                        }}
                                    >
                                        <span className="icon">⚖️</span>
                                        Compare
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Compare Modal */}
            {showCompareModal && (
                <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Compare Versions</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowCompareModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="compare-section">
                            <div className="form-group">
                                <label>Version 1</label>
                                <select
                                    value={compareVersions.v1?.id || ''}
                                    onChange={(e) => {
                                        const v = versions.find(v => v.id === parseInt(e.target.value));
                                        setCompareVersions({ ...compareVersions, v1: v });
                                    }}
                                >
                                    <option value="">Select version...</option>
                                    {versions.map(v => (
                                        <option key={v.id} value={v.id}>v{v.version} - {v.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="compare-divider">
                                <span className="icon">⚖️</span>
                            </div>

                            <div className="form-group">
                                <label>Version 2</label>
                                <select
                                    value={compareVersions.v2?.id || ''}
                                    onChange={(e) => {
                                        const v = versions.find(v => v.id === parseInt(e.target.value));
                                        setCompareVersions({ ...compareVersions, v2: v });
                                    }}
                                >
                                    <option value="">Select version...</option>
                                    {versions.map(v => (
                                        <option key={v.id} value={v.id}>v{v.version} - {v.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {compareVersions.v1 && compareVersions.v2 && (
                            <div className="comparison-result">
                                <h3>Comparison Results</h3>
                                <div className="comparison-grid">
                                    <div className="comparison-item">
                                        <h4>v{compareVersions.v1.version}</h4>
                                        <p>Files: {compareVersions.v1.filesChanged}</p>
                                        <p>Additions: {compareVersions.v1.additions}</p>
                                        <p>Deletions: {compareVersions.v1.deletions}</p>
                                    </div>
                                    <div className="comparison-item">
                                        <h4>v{compareVersions.v2.version}</h4>
                                        <p>Files: {compareVersions.v2.filesChanged}</p>
                                        <p>Additions: {compareVersions.v2.additions}</p>
                                        <p>Deletions: {compareVersions.v2.deletions}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCompareModal(false)}
                            >
                                Close
                            </button>
                            <button className="btn-primary">
                                View Detailed Diff
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VersionHistory;
