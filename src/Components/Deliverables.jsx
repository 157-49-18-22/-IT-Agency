import React, { useMemo, useState } from 'react';
import { FiUploadCloud, FiGrid, FiList, FiSearch, FiFilter, FiDownload, FiEye, FiShare2, FiFile, FiFolder } from 'react-icons/fi';
import './Deliverables.css';

const seed = [
  { id: 'DL-1001', name: 'Wireframes.zip', project: 'Website Revamp', stage: 'UI/UX', type: 'Archive', size: '12.4 MB', version: 'v3', status: 'Submitted', date: '2025-11-02' },
  { id: 'DL-1002', name: 'Mockups.pdf', project: 'E-commerce Platform', stage: 'UI/UX', type: 'PDF', size: '8.1 MB', version: 'v2', status: 'Approved', date: '2025-11-04' },
  { id: 'DL-1003', name: 'API Spec.yaml', project: 'API Backend', stage: 'Development', type: 'YAML', size: '120 KB', version: 'v1', status: 'Draft', date: '2025-11-03' },
  { id: 'DL-1004', name: 'Build_1.0.3.apk', project: 'Mobile App', stage: 'Testing', type: 'APK', size: '38.2 MB', version: '1.0.3', status: 'Submitted', date: '2025-11-05' }
];

export default function Deliverables() {
  const [items, setItems] = useState(seed);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('All');
  const [type, setType] = useState('All');
  const [view, setView] = useState('grid');

  const filtered = useMemo(() => {
    return items
      .filter(it => stage === 'All' || it.stage === stage)
      .filter(it => type === 'All' || it.type === type)
      .filter(it => `${it.name} ${it.project} ${it.type} ${it.stage}`.toLowerCase().includes(q.toLowerCase()));
  }, [items, stage, type, q]);

  const submitForApproval = (id) => {
    setItems(prev => prev.map(it => it.id===id ? { ...it, status: 'Submitted' } : it));
  };

  return (
    <div className="deliverables">
      <div className="head">
        <div className="title">Deliverables</div>
        <div className="actions">
          <button className="upload"><FiUploadCloud/> Upload Files</button>
          <div className="toggle">
            <button className={`icon ${view==='grid'?'active':''}`} onClick={()=>setView('grid')}><FiGrid/></button>
            <button className={`icon ${view==='list'?'active':''}`} onClick={()=>setView('list')}><FiList/></button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <FiSearch/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search files, projects, types" />
        </div>
        <div className="filters">
          <FiFilter/>
          <select value={stage} onChange={e=>setStage(e.target.value)}>
            {['All','UI/UX','Development','Testing'].map(s=> <option key={s}>{s}</option>)}
          </select>
          <select value={type} onChange={e=>setType(e.target.value)}>
            {['All','PDF','Archive','YAML','APK'].map(t=> <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {view==='grid' ? (
        <div className="grid">
          {filtered.map(it => (
            <div key={it.id} className="card">
              <div className="file-icon">{it.type==='Archive' ? <FiFolder/> : <FiFile/>}</div>
              <div className="name" title={it.name}>{it.name}</div>
              <div className="meta">
                <span className="project">{it.project}</span>
                <span className="sep">•</span>
                <span>{it.size}</span>
              </div>
              <div className="badges">
                <span className="pill version">{it.version}</span>
                <span className={`pill status ${it.status.toLowerCase()}`}>{it.status}</span>
                <span className="pill stage">{it.stage}</span>
              </div>
              <div className="card-actions">
                <button className="ghost"><FiEye/> Preview</button>
                <button className="ghost"><FiDownload/> Download</button>
                {it.status==='Draft' && (
                  <button className="primary" onClick={()=>submitForApproval(it.id)}><FiShare2/> Submit</button>
                )}
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="empty">No files found.</div>}
        </div>
      ) : (
        <div className="list">
          <div className="list-head">
            <div className="cell w-34">File</div>
            <div className="cell w-22">Project</div>
            <div className="cell w-12">Version</div>
            <div className="cell w-12">Stage</div>
            <div className="cell w-10">Size</div>
            <div className="cell w-10 right">Actions</div>
          </div>
          {filtered.map(it => (
            <div key={it.id} className="row">
              <div className="cell w-34 ellipsis"><FiFile/> {it.name}</div>
              <div className="cell w-22 ellipsis">{it.project}</div>
              <div className="cell w-12"><span className="pill version">{it.version}</span></div>
              <div className="cell w-12"><span className="pill stage">{it.stage}</span></div>
              <div className="cell w-10">{it.size}</div>
              <div className="cell w-10 right actions">
                <button className="ghost"><FiEye/></button>
                <button className="ghost"><FiDownload/></button>
                {it.status==='Draft' && (
                  <button className="primary" onClick={()=>submitForApproval(it.id)}><FiShare2/> Submit</button>
                )}
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="empty">No files found.</div>}
        </div>
      )}
    </div>
  );
}
