import React, { useMemo, useRef, useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiSend, FiPaperclip, FiUser, FiCheckCircle } from 'react-icons/fi';
import './Messages.css';
import { messageAPI } from '../services/api';

const seedThreads = [
  { id: 'T-1', title: 'Website Revamp • Client', last: 'Approved: Mockups v2', unread: 2, participants: ['You','Client Approver'] },
  { id: 'T-2', title: 'E-commerce • Dev Team', last: 'Deploy tonight?', unread: 0, participants: ['Alex','Jane','You'] },
  { id: 'T-3', title: 'Mobile App • QA', last: 'Regression 1.0.3 passed', unread: 0, participants: ['QA Bot','You'] },
];

const seedMessages = {
  'T-1': [
    { id:'m1', who:'Client Approver', me:false, text:'Looks good! Approving Mockups v2.', ts:'18:10' },
    { id:'m2', who:'You', me:true, text:'Great, we will start Development.', ts:'18:12' },
  ],
  'T-2': [
    { id:'m3', who:'Alex', me:false, text:'Deploy tonight?', ts:'16:20' },
    { id:'m4', who:'You', me:true, text:'Yes, after QA sign-off.', ts:'16:25' },
  ],
  'T-3': [
    { id:'m5', who:'QA Bot', me:false, text:'Regression 1.0.3 passed ✅', ts:'15:00' },
    { id:'m6', who:'You', me:true, text:'Nice, proceeding to UAT.', ts:'15:05' },
  ]
};

export default function Messages(){
  // State hooks at the top
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [q, setQ] = useState('');
  const [text, setText] = useState('');
  const [store, setStore] = useState({});
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  // Memoized values
  const filteredThreads = useMemo(() => 
    threads.filter(t => t.title.toLowerCase().includes(q.toLowerCase())), 
    [threads, q]
  );
  
  const activeMsgs = store[activeId] || [];

  // Effects after all state and memos
  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => { 
    endRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [activeId, activeMsgs.length]);

  // Handler functions
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getAll();
      const messages = response.data || [];
      setThreads(messages);
      if (messages.length > 0 && !activeId) {
        setActiveId(messages[0].id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!text.trim()) return;
    try {
      await messageAPI.send({
        content: text,
        thread: activeId
      });
      fetchMessages();
      setText('');
    } catch (error) {
      alert('Error sending message');
    }
  };

  if (loading) return <div className="loading">Loading messages...</div>;

  const send = () => {
    if(!text.trim()) return;
    const msg = { id: `m${Date.now()}`, who:'You', me:true, text: text.trim(), ts: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setStore(prev => ({ ...prev, [activeId]: [...(prev[activeId]||[]), msg] }));
    setThreads(prev => prev.map(t => t.id===activeId ? { ...t, last: text.trim(), unread: 0 } : t));
    setText('');
  };

  return (
    <div className="messages">
      <aside className="left">
        <div className="left-head">
          <div className="title">Messages</div>
          <div className="search">
            <FiSearch/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search threads"/>
          </div>
        </div>
        <div className="thread-list">
          {filteredThreads.map(t => (
            <button key={t.id} className={`thread ${t.id===activeId?'active':''}`} onClick={()=>setActiveId(t.id)}>
              <div className="avatar"><FiUser/></div>
              <div className="info">
                <div className="top">
                  <div className="name">{t.title}</div>
                  {t.unread>0 && <span className="unread">{t.unread}</span>}
                </div>
                <div className="last">{t.last}</div>
              </div>
            </button>
          ))}
          {filteredThreads.length===0 && <div className="empty">No threads</div>}
        </div>
      </aside>

      <section className="chat">
        <div className="chat-head">
          <div className="peer">
            <div className="avatar"><FiUser/></div>
            <div className="names">
              <div className="who">{threads.find(t=>t.id===activeId)?.title || 'Thread'}</div>
              <div className="sub">{(threads.find(t=>t.id===activeId)?.participants || []).join(', ')}</div>
            </div>
          </div>
          <div className="head-actions">
            <button className="ghost"><FiFilter/> Filter</button>
            <span className="online"><FiCheckCircle/> Secure</span>
          </div>
        </div>

        <div className="chat-body">
          {activeMsgs.map(m => (
            <div key={m.id} className={`bubble ${m.me?'me':'them'}`}>
              <div className="text">{m.text}</div>
              <div className="meta">{m.who} • {m.ts}</div>
            </div>
          ))}
          <div ref={endRef}></div>
        </div>

        <div className="composer">
          <button className="attach"><FiPaperclip/></button>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }} />
          <button className="send" onClick={send}><FiSend/> Send</button>
        </div>
      </section>
    </div>
  );
}

