import React, { useMemo, useState } from 'react';
import { FiPlus, FiTrash2, FiFilter, FiChevronDown, FiSearch } from 'react-icons/fi';
import './Custom.css';

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
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(['project','member','type','amount','status']);
  const [filters, setFilters] = useState([{ field: 'project', value: '' }]);

  const addFilter = () => setFilters(prev => [...prev, { field: 'project', value: '' }]);
  const removeFilter = (idx) => setFilters(prev => prev.filter((_,i)=>i!==idx));
  const updateFilter = (idx, patch) => setFilters(prev => prev.map((f,i)=> i===idx ? { ...f, ...patch } : f));

  const filtered = useMemo(() => data.filter(row => {
    if (q && !Object.values(row).join(' ').toLowerCase().includes(q.toLowerCase())) return false;
    for (const f of filters) {
      if (f.value && String(row[f.field]).toLowerCase().indexOf(f.value.toLowerCase()) === -1) return false;
    }
    return true;
  }), [q, filters]);

  const totals = useMemo(() => ({
    count: filtered.length,
    positive: filtered.filter(r=>r.amount>0).reduce((s,r)=>s+r.amount,0),
    negative: Math.abs(filtered.filter(r=>r.amount<0).reduce((s,r)=>s+r.amount,0))
  }), [filtered]);

  return (
    <div className="cr-container">
      <div className="cr-header">
        <div>
          <h2>Custom Reports</h2>
          <p>Build custom reports by choosing fields and adding filters.</p>
        </div>
      </div>

      <div className="builder">
        <div className="builder-left">
          <div className="section-title">Fields</div>
          <div className="fields">
            {fields.map(f => (
              <label key={f.key} className="field-item">
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

          <div className="section-title">Filters</div>
          <div className="filters-panel">
            {filters.map((f, idx) => (
              <div className="filter-row" key={idx}>
                <div className="select">
                  <FiFilter className="icon" />
                  <select value={f.field} onChange={e=>updateFilter(idx,{ field: e.target.value })}>
                    {fields.map(fl => <option key={fl.key} value={fl.key}>{fl.label}</option>)}
                  </select>
                  <FiChevronDown className="chev" />
                </div>
                <input className="value" value={f.value} onChange={e=>updateFilter(idx,{ value: e.target.value })} placeholder="Contains..." />
                <button className="icon-btn" onClick={()=>removeFilter(idx)} title="Remove"><FiTrash2/></button>
              </div>
            ))}
            <button className="btn-outline" onClick={addFilter}><FiPlus/> Add filter</button>
          </div>
        </div>

        <div className="builder-right">
          <div className="toolbar">
            <div className="search">
              <FiSearch className="icon" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search data..." />
            </div>
          </div>

          <div className="summary">
            <div className="tile">
              <div className="t-label">Rows</div>
              <div className="t-value">{totals.count}</div>
            </div>
            <div className="tile">
              <div className="t-label">Positive</div>
              <div className="t-value green">${totals.positive.toLocaleString()}</div>
            </div>
            <div className="tile">
              <div className="t-label">Negative</div>
              <div className="t-value red">-${totals.negative.toLocaleString()}</div>
            </div>
          </div>

          <div className="table">
            <div className="thead">
              {selected.map(k => <div key={k}>{fields.find(f=>f.key===k)?.label}</div>)}
            </div>
            <div className="tbody">
              {filtered.map(r => (
                <div className="row" key={r.id}>
                  {selected.map(k => (
                    <div key={k} className={k==='amount'?`mono ${r[k]<0?'neg':'pos'}`:''}>
                      {k==='amount' ? `${r[k]<0?'-':''}$${Math.abs(r[k]).toLocaleString()}` : r[k]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

