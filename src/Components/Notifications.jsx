import React, { useMemo, useState } from 'react';
import { FiBell, FiCheckCircle, FiClock, FiMessageCircle, FiUser, FiSearch, FiFilter, FiAlertTriangle, FiFileText, FiAtSign } from 'react-icons/fi';
import './Notifications.css';
import { notificationAPI } from '../services/api';

const seed = [
  { id:'N-3010', type:'Approval', title:'Approval required: UI Mockups v2', desc:'E-commerce Platform', time:'2m ago', read:false },
  { id:'N-3009', type:'Mention', title:'@You commented on Task #142', desc:'"Please review the API spec"', time:'10m ago', read:false },
  { id:'N-3008', type:'System', title:'Deployment completed', desc:'Website Revamp • prod@1.0.3', time:'1h ago', read:true },
  { id:'N-3007', type:'Message', title:'New message from Client', desc:'Project timeline update', time:'3h ago', read:true },
  { id:'N-3006', type:'Alert', title:'High severity bug reported', desc:'#BUG-221 • Mobile App', time:'Yesterday', read:true }
];

const TypeIcon = ({t}) => {
  switch(t){
    case 'Approval': return <FiCheckCircle/>;
    case 'Message': return <FiMessageCircle/>;
    case 'Mention': return <FiAtSign/>;
    case 'System': return <FiFileText/>;
    case 'Alert': return <FiAlertTriangle/>;
    default: return <FiBell/>;
  }
};

export default function Notifications(){
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [prefs, setPrefs] = useState({ approval:true, message:true, mention:true, system:true, alert:true });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      alert('Error marking as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      alert('Error');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const filtered = useMemo(()=>{
    const base = notifications.filter(n => {
      if(tab==='Unread' && n.read) return false;
      if(tab==='Mentions' && n.type!=='Mention') return false;
      if(tab==='System' && n.type!=='System') return false;
      return true;
    }).filter(n => `${n.title} ${n.desc}`.toLowerCase().includes(q.toLowerCase()));
    return base;
  }, [items, tab, q]);

  const markAllRead = () => setItems(prev => prev.map(n => ({...n, read:true})));
  const toggleRead = (id) => setItems(prev => prev.map(n => n.id===id ? ({...n, read:!n.read}) : n));

  const counts = useMemo(()=>({
    all: items.length,
    unread: items.filter(n=>!n.read).length,
    mentions: items.filter(n=>n.type==='Mention').length,
    system: items.filter(n=>n.type==='System').length
  }), [items]);

  return (
    <div className="notifications">
      <div className="head">
        <div className="title"><FiBell/> Notifications</div>
        <div className="tools">
          <div className="search">
            <FiSearch/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search notifications"/>
          </div>
          <button className="mark" onClick={markAllRead}><FiCheckCircle/> Mark all read</button>
        </div>
      </div>

      <div className="tabs">
        {[
          {key:'All', label:`All (${counts.all})`},
          {key:'Unread', label:`Unread (${counts.unread})`},
          {key:'Mentions', label:`Mentions (${counts.mentions})`},
          {key:'System', label:`System (${counts.system})`}
        ].map(t => (
          <button key={t.key} className={`tab ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="layout">
        <div className="center">
          {filtered.map(n => (
            <div key={n.id} className={`item ${n.read?'read':'unread'} type-${n.type.toLowerCase()}`}>
              <div className="icon"><TypeIcon t={n.type}/></div>
              <div className="content">
                <div className="row1">
                  <div className="title">{n.title}</div>
                  <div className="time"><FiClock/> {n.time}</div>
                </div>
                <div className="row2">{n.desc}</div>
              </div>
              <div className="actions">
                <button className="ghost" onClick={()=>toggleRead(n.id)}>{n.read?'Mark unread':'Mark read'}</button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="empty">No notifications.</div>}
        </div>

        <aside className="side">
          <div className="card">
            <div className="card-title">Preferences</div>
            {Object.entries(prefs).map(([k,v]) => (
              <label key={k} className="pref">
                <input type="checkbox" checked={v} onChange={()=>setPrefs(prev=>({...prev,[k]:!prev[k]}))} />
                <span className="label">{k.charAt(0).toUpperCase()+k.slice(1)}</span>
              </label>
            ))}
            <div className="hint">These are demo toggles for UI only.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

