import React, { useMemo, useState, useEffect } from 'react';
import { FiCheck, FiX, FiSearch, FiFilter, FiChevronRight, FiClock, FiFile, FiUser, FiCalendar } from 'react-icons/fi';
import './Approvals.css';
import { approvalAPI } from '../services/api';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalAPI.getAll();
      setApprovals(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approvalAPI.approve(id, {});
      fetchApprovals();
    } catch (error) {
      alert('Error approving');
    }
  };

  const handleReject = async (id) => {
    try {
      await approvalAPI.reject(id, {});
      fetchApprovals();
    } catch (error) {
      alert('Error rejecting');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const counts = useMemo(() => {
    return approvals.reduce((acc, it) => { acc[it.status] = (acc[it.status] || 0) + 1; return acc; }, {});
  }, [approvals]);

  const filtered = useMemo(() => {
    return approvals.filter(it => (activeTab === 'All' || it.status === activeTab))
      .filter(it => (type === 'All' || it.type === type))
      .filter(it => Object.values(it).join(' ').toLowerCase().includes(q.toLowerCase()));
  }, [approvals, activeTab, type, q]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const quickApprove = (id) => handleApprove(id);
  const quickReject = (id) => handleReject(id);

  return (
    <div className="approvals">
      <div className="approvals-header">
        <div className="title">Approvals</div>
        <div className="meta">
          <span className="badge">Pending {counts.Pending || 0}</span>
          <span className="badge success">Approved {counts.Approved || 0}</span>
          <span className="badge danger">Rejected {counts.Rejected || 0}</span>
        </div>
      </div>

      <div className="tabs">
        {['Pending','Approved','Rejected','All'].map(t => (
          <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search">
          <FiSearch />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search approvals, projects, users" />
        </div>
        <div className="filters">
          <FiFilter />
          <select value={type} onChange={e=>setType(e.target.value)}>
            {['All','Deliverable','Stage Transition','Bug Fix'].map(o=> <option key={o}>{o}</option>)}
          </select>
          {selected.length>0 && (
            <div className="bulk">
              <button className="approve" onClick={()=>setStatus(selected,'Approved')}><FiCheck/> Approve {selected.length}</button>
              <button className="reject" onClick={()=>setStatus(selected,'Rejected')}><FiX/> Reject</button>
            </div>
          )}
        </div>
      </div>

      <div className="list">
        <div className="list-head">
          <div className="cell w-40">Item</div>
          <div className="cell w-20">Project</div>
          <div className="cell w-12">Priority</div>
          <div className="cell w-14">Requested</div>
          <div className="cell w-14 right">Actions</div>
        </div>

        {filtered.map(it => (
          <div key={it.id} className={`row ${it.status.toLowerCase()}`}>
            <div className="cell w-40">
              <label className="checkbox">
                <input type="checkbox" checked={selected.includes(it.id)} onChange={()=>toggleSelect(it.id)} />
                <span></span>
              </label>
              <div className="item-meta">
                <div className="item-title"><FiFile/> {it.title} <span className={`pill ${it.type.replace(/\s/g,'').toLowerCase()}`}>{it.type}</span></div>
                <div className="item-sub"><span>#{it.id}</span> <span className="dot">•</span> <FiUser/> {it.requestedBy} <span className="dot">•</span> <FiCalendar/> {it.date}</div>
              </div>
            </div>
            <div className="cell w-20 ellipsis">{it.project}</div>
            <div className={`cell w-12`}>
              <span className={`priority ${it.priority.toLowerCase()}`}>{it.priority}</span>
            </div>
            <div className="cell w-14">{it.requestedTo}</div>
            <div className="cell w-14 right actions">
              {it.status==='Pending' ? (
                <>
                  <button className="approve ghost" onClick={()=>quickApprove(it.id)}><FiCheck/> Approve</button>
                  <button className="reject ghost" onClick={()=>quickReject(it.id)}><FiX/> Reject</button>
                </>
              ) : (
                <span className={`status-tag ${it.status.toLowerCase()}`}>{it.status}</span>
              )}
              <button className="view" onClick={()=>setDetail(it)}><FiChevronRight/></button>
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <div className="empty">
            <FiClock/>
            <p>No items in {active}.</p>
          </div>
        )}
      </div>

      {detail && (
        <div className="drawer" onClick={()=>setDetail(null)}>
          <div className="drawer-panel" onClick={e=>e.stopPropagation()}>
            <div className="drawer-head">
              <div className="drawer-title">{detail.title}</div>
              <div className="drawer-sub">{detail.type} • {detail.project} • {detail.id}</div>
            </div>
            <div className="drawer-body">
              <div className="field"><span>Requested By</span><b>{detail.requestedBy}</b></div>
              <div className="field"><span>Requested To</span><b>{detail.requestedTo}</b></div>
              <div className="field"><span>Date</span><b>{detail.date}</b></div>
              <div className="field"><span>Priority</span><b className={`priority ${detail.priority.toLowerCase()}`}>{detail.priority}</b></div>
              <div className="field"><span>Version</span><b>{detail.version}</b></div>
              <div className="notes">{detail.notes}</div>
            </div>
            {detail.status==='Pending' && (
              <div className="drawer-actions">
                <button className="approve" onClick={()=>{quickApprove(detail.id); setDetail(null);}}><FiCheck/> Approve</button>
                <button className="reject" onClick={()=>{quickReject(detail.id); setDetail(null);}}><FiX/> Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
