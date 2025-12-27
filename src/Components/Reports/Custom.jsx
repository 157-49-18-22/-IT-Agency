import React, { useMemo, useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiFilter, FiChevronDown, FiSearch, FiLayout, FiAlertCircle } from 'react-icons/fi';
import './Custom.css';
import { reportAPI } from '../../services/api';

const fields = [
  { key: 'project', label: 'Project' },
  { key: 'member', label: 'Member' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

const data = [
  { id: 1, project: 'Website Revamp', member: 'John Doe', type: 'Invoice', status: 'Paid', amount: 1200 },
  { id: 2, project: 'API Backend', member: 'Jane Smith', type: 'Expense', status: 'Approved', amount: -180 },
  { id: 3, project: 'Mobile App', member: 'Alex Johnson', type: 'Invoice', status: 'Unpaid', amount: 900 },
  { id: 4, project: 'Website Revamp', member: 'Sarah Lee', type: 'Expense', status: 'Pending', amount: -60 },
];

export default function Custom() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(['project', 'member', 'type', 'amount', 'status']);
  const [filters, setFilters] = useState([{ field: 'project', value: '' }]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await reportAPI.getCustom();
        setReportData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchReport();
  }, []);

  const filtered = useMemo(() => {
    if (loading) return [];
    return data.filter(row => {
      if (q && !Object.values(row).join(' ').toLowerCase().includes(q.toLowerCase())) return false;
      return filters.every(({ field, value }) => {
        if (!value) return true;
        return String(row[field]).toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, q, filters, loading]);

  const totals = useMemo(() => ({
    count: filtered.length,
    positive: filtered.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0),
    negative: Math.abs(filtered.filter(r => r.amount < 0).reduce((s, r) => s + r.amount, 0))
  }), [filtered]);

  const addFilter = () => setFilters(prev => [...prev, { field: 'project', value: '' }]);
  const removeFilter = (idx) => setFilters(prev => prev.filter((_, i) => i !== idx));
  const updateFilter = (idx, patch) =>
    setFilters(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));

  if (loading) {
    return (
      <div className="cr-loading">
        <div className="spinner"></div>
        <p>Generating Report...</p>
      </div>
    );
  }

  return (
    <div className="cr-container">
      <div className="cr-header">
        <div>
          <h2>Custom Reports</h2>
          <p>Design your own reports by selecting fields and applying filters.</p>
        </div>
      </div>

      <div className="builder">
        {/* Left Sidebar: Controls */}
        <div className="builder-left slide-in">
          <div className="panel-section">
            <div className="section-header">
              <FiLayout /> Fields
            </div>
            <div className="fields-grid">
              {fields.map(f => (
                <label key={f.key} className={`field-checkbox ${selected.includes(f.key) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected.includes(f.key)}
                    onChange={e => {
                      setSelected(prev => e.target.checked ? [...prev, f.key] : prev.filter(k => k !== f.key));
                    }}
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="panel-divider"></div>

          <div className="panel-section">
            <div className="section-header">
              <FiFilter /> Filters
            </div>
            <div className="filters-list">
              {filters.map((f, idx) => (
                <div className="filter-item fade-in" key={idx}>
                  <div className="filter-top">
                    <div className="select-wrapper">
                      <select value={f.field} onChange={e => updateFilter(idx, { field: e.target.value })}>
                        {fields.map(fl => <option key={fl.key} value={fl.key}>{fl.label}</option>)}
                      </select>
                      <FiChevronDown className="chev" />
                    </div>
                    <button className="remove-btn" onClick={() => removeFilter(idx)}><FiTrash2 /></button>
                  </div>
                  <input
                    className="filter-input"
                    value={f.value}
                    onChange={e => updateFilter(idx, { value: e.target.value })}
                    placeholder="Value to match..."
                  />
                </div>
              ))}
              <button className="add-filter-btn" onClick={addFilter}>
                <FiPlus /> Add Filter
              </button>
            </div>
          </div>
        </div>

        {/* Right Content: Data */}
        <div className="builder-right slide-in-delay">
          <div className="toolbar-top">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search across all data..."
              />
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span className="label">Total Rows</span>
              <span className="value">{totals.count}</span>
            </div>
            <div className="metric-card positive">
              <span className="label">Total Income</span>
              <span className="value">+${totals.positive.toLocaleString()}</span>
            </div>
            <div className="metric-card negative">
              <span className="label">Total Expense</span>
              <span className="value">-${totals.negative.toLocaleString()}</span>
            </div>
          </div>

          <div className="data-table-container">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <FiAlertCircle className="empty-icon" />
                <p>No results found matching your criteria.</p>
                <button onClick={() => { setQ(''); setFilters([]); }}>Clear Filters</button>
              </div>
            ) : (
              <div className="custom-table" style={{ '--col': selected.length }}>
                <div className="ct-head">
                  <div className="ct-row">
                    {selected.map(k => (
                      <div className="ct-cell header" key={k}>
                        {fields.find(f => f.key === k)?.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ct-body">
                  {filtered.map(r => (
                    <div className="ct-row" key={r.id}>
                      {selected.map(k => (
                        <div key={k} className={`ct-cell ${k === 'amount' ? 'mono' : ''} ${k === 'status' ? 'status-cell' : ''}`}>
                          {k === 'status' ? (
                            <span className={`status-pill ${r[k].toLowerCase()}`}>{r[k]}</span>
                          ) : (
                            k === 'amount'
                              ? <span className={r[k] < 0 ? 'text-red' : 'text-green'}>
                                {r[k] < 0 ? '-' : ''}${Math.abs(r[k]).toLocaleString()}
                              </span>
                              : r[k]
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
