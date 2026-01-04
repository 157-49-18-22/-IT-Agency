import React, { useMemo, useRef, useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiSend, FiPaperclip, FiUser, FiCheckCircle, FiPlus, FiX, FiCornerUpLeft, FiTrash2 } from 'react-icons/fi';
import './Messages.css';
import { messageAPI, teamAPI, userAPI, uploadAPI } from '../services/api';

const BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://itbackend-p8k1.onrender.com/api');
const STATIC_URL = BASE_URL.replace('/api', '');

export default function Messages() {
    // State hooks at the top
    const [threads, setThreads] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [q, setQ] = useState('');
    const [text, setText] = useState('');
    const [store, setStore] = useState({});
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const endRef = useRef(null);
    const fileInputRef = useRef(null);

    // Memoized values
    const filteredThreads = useMemo(() =>
        threads.filter(t => t.title.toLowerCase().includes(q.toLowerCase())),
        [threads, q]
    );

    const activeMsgs = store[activeId] || [];

    // Effects after all state and memos
    useEffect(() => {
        fetchMessages(true);

        // Auto-refresh every 10 seconds to get new messages
        const timer = setInterval(() => fetchMessages(false), 10000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeId, activeMsgs.length]);

    // Handler functions
    const fetchMessages = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const response = await messageAPI.getMessages();
            console.log('📨 Fetched messages response:', response.data);

            const messages = response.data?.data || [];
            const groupedThreads = {};
            const groupedMessages = {};

            const storedUser = localStorage.getItem('user');
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const currentUserId = currentUser?.id;

            // Normalize currentUserId for comparison
            const myId = currentUserId ? parseInt(currentUserId) : null;

            (Array.isArray(messages) ? messages : []).forEach(msg => {
                const sId = parseInt(msg.senderId);
                const isMe = myId === sId;

                // Thread Grouping
                if (!groupedThreads[msg.thread]) {
                    let threadTitle = 'Unknown';
                    let threadParticipants = [];

                    if (isMe) {
                        if (msg.recipientDetails && msg.recipientDetails.length > 0) {
                            threadTitle = msg.recipientDetails[0].name;
                            threadParticipants = ['You', msg.recipientDetails[0].name];
                        } else if (msg.recipients && msg.recipients.length > 0) {
                            threadTitle = `User ${msg.recipients[0]}`;
                            threadParticipants = ['You', `User ${msg.recipients[0]}`];
                        }
                    } else {
                        threadTitle = msg.sender?.name || 'Unknown';
                        threadParticipants = [msg.sender?.name || 'User', 'You'];
                    }

                    groupedThreads[msg.thread] = {
                        id: msg.thread,
                        title: threadTitle,
                        last: msg.content,
                        unread: 0,
                        participants: threadParticipants,
                        ts: msg.createdAt,
                        recipientIds: msg.recipients || []
                    };
                } else if (new Date(msg.createdAt) > new Date(groupedThreads[msg.thread].ts)) {
                    groupedThreads[msg.thread].last = msg.content;
                    groupedThreads[msg.thread].ts = msg.createdAt;
                }

                // Message Store Grouping
                if (!groupedMessages[msg.thread]) {
                    groupedMessages[msg.thread] = [];
                }

                groupedMessages[msg.thread].push({
                    id: msg.id,
                    who: msg.sender?.name || (isMe ? (currentUser?.name || 'Me') : 'Other'),
                    me: isMe,
                    text: msg.content,
                    ts: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    rawTs: msg.createdAt,
                    attachments: msg.attachments || [],
                    replyTo: msg.replyTo || null
                });
            });

            // Sort messages
            Object.keys(groupedMessages).forEach(tid => {
                groupedMessages[tid].sort((a, b) => new Date(a.rawTs) - new Date(b.rawTs));
            });

            setThreads(Object.values(groupedThreads).sort((a, b) => new Date(b.ts) - new Date(a.ts)));
            setStore(groupedMessages);

            const threadList = Object.values(groupedThreads);
            if (threadList.length > 0 && !activeId) {
                setActiveId(threadList[0].id);
            }
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const send = async (attachments = []) => {
        if (!text.trim() && attachments.length === 0) return;
        if (!activeId) return;

        const messageText = text;
        const tempId = `temp-${Date.now()}`;
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { name: 'Me' };

        // 1. Optimistic UI Update - Show message immediately
        const optimisticMsg = {
            id: tempId,
            who: user.name || 'Me',
            me: true,
            text: messageText,
            ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawTs: new Date().toISOString(),
            attachments: attachments,
            replyTo: replyTo ? { id: replyTo.id, content: replyTo.text, sender: replyTo.who } : null
        };

        setStore(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), optimisticMsg]
        }));
        setText('');
        setReplyTo(null);

        try {
            let payload = {
                content: messageText || (attachments.length > 0 ? 'Sent a file' : ''),
                thread: activeId,
                attachments: attachments,
                parentMessageId: optimisticMsg.replyTo?.id
            };
            const currentThread = threads.find(t => t.id === activeId);

            if (typeof activeId === 'string' && activeId.startsWith('new-')) {
                if (currentThread && currentThread.recipientId) {
                    payload.recipient = currentThread.recipientId;
                }
            }

            const response = await messageAPI.sendMessage(payload);
            const newMessage = response.data?.data;

            if (newMessage && newMessage.thread) {
                // If it was a new temporary thread, transition to real thread
                if (String(activeId).startsWith('new-')) {
                    const realThreadId = newMessage.thread;

                    setStore(prev => {
                        const newStore = { ...prev };
                        const existingMsgs = newStore[activeId] || [];
                        delete newStore[activeId];
                        newStore[realThreadId] = existingMsgs;
                        return newStore;
                    });

                    setActiveId(realThreadId);
                }
            }

            // Silent refetch to sync everything
            await fetchMessages(false);

        } catch (error) {
            console.error('❌ Error sending message:', error);
            // Rollback optimistic update on error
            setStore(prev => {
                const newStore = { ...prev };
                if (newStore[activeId]) {
                    newStore[activeId] = newStore[activeId].filter(m => m.id !== tempId);
                }
                return newStore;
            });
            setText(messageText);
            alert('Failed to send message. Please check your connection.');
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await messageAPI.deleteMessage(id);
            setStore(prev => {
                const newStore = { ...prev };
                if (newStore[activeId]) {
                    newStore[activeId] = newStore[activeId].filter(m => m.id !== id);
                }
                return newStore;
            });
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Could not delete message');
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const onFileSelected = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await uploadAPI.uploadFile(formData);
            if (res.data?.success) {
                const fileData = res.data.file;
                // Auto-send the file as a message
                await send([{
                    name: fileData.originalName,
                    url: fileData.path,
                    type: fileData.mimetype,
                    size: fileData.size
                }]);
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("File upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${STATIC_URL}${path}`;
    };

    // Fetch users when modal opens
    useEffect(() => {
        if (showModal) {
            loadUsers();
        }
    }, [showModal]);

    const loadUsers = async () => {
        try {
            // Try fetching from Team API first
            const res = await teamAPI.getAll();
            let membersData = res.data?.data?.members || [];

            // If no members found via Team API, try User API as fallback
            if (!membersData || membersData.length === 0) {
                const userRes = await userAPI.getUsers();
                // userAPI usually returns { data: [...] } or just [...]
                membersData = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.users || []);
            }

            setUsers(Array.isArray(membersData) ? membersData : []);

        } catch (e) {
            console.error("Failed to load users", e);
            // Try fallback if teamAPI failed
            try {
                const userRes = await userAPI.getUsers();
                const membersData = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.users || []);
                setUsers(membersData);
            } catch (ex) {
                setUsers([]);
            }
        }
    };

    const startChat = (user) => {
        // Check if we already have a thread with this specific user ID
        // (threads.recipientIds is an array of IDs)
        const existing = threads.find(t =>
            t.recipientIds.map(id => parseInt(id)).includes(parseInt(user.id)) ||
            t.title === user.name
        );

        if (existing) {
            setActiveId(existing.id);
            setShowModal(false);
        } else {
            // Create a new temporary thread
            const newThreadId = `new-${Date.now()}`;
            const newThread = {
                id: newThreadId,
                title: user.name,
                last: 'Start a conversation...',
                unread: 0,
                participants: ['You', user.name],
                recipientId: user.id,
                recipientIds: [user.id],
                ts: new Date().toISOString()
            };
            setThreads(prev => [newThread, ...prev]);
            setActiveId(newThreadId);
            setStore(prev => ({ ...prev, [newThreadId]: [] }));
            setShowModal(false);
        }
    };

    if (loading) return <div className="loading">Loading messages...</div>;

    return (
        <div className="messages">
            <aside className="left">
                <div className="left-head">
                    <div className="header-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="title">Messages</div>
                        </div>
                        <button className="new-chat-btn-large" onClick={() => setShowModal(true)} style={{
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            transition: 'background 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <FiPlus size={18} /> Start New Chat
                        </button>
                    </div>
                    <div className="search">
                        <FiSearch />
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search threads" />
                    </div>
                </div>
                <div className="thread-list">
                    {filteredThreads.map(t => (
                        <button key={t.id} className={`thread ${t.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(t.id)}>
                            <div className="avatar"><FiUser /></div>
                            <div className="info">
                                <div className="top">
                                    <div className="name">{t.title}</div>
                                    {t.unread > 0 && <span className="unread">{t.unread}</span>}
                                </div>
                                <div className="last">{t.last}</div>
                            </div>
                        </button>
                    ))}
                    {filteredThreads.length === 0 && <div className="empty">No threads</div>}
                </div>
            </aside>

            <section className="chat">
                {activeId ? (
                    <>
                        <div className="chat-head">
                            <div className="peer">
                                <div className="avatar"><FiUser /></div>
                                <div className="names">
                                    <div className="who">{threads.find(t => t.id === activeId)?.title || 'Thread'}</div>
                                    <div className="sub">{(threads.find(t => t.id === activeId)?.participants || []).join(', ')}</div>
                                </div>
                            </div>
                            <div className="head-actions">
                                <button className="ghost"><FiFilter /> Filter</button>
                                <span className="online"><FiCheckCircle /> Secure</span>
                            </div>
                        </div>

                        <div className="chat-body">
                            {activeMsgs.map(m => (
                                <div key={m.id} className={`bubble-container ${m.me ? 'me' : 'them'}`}>
                                    <div className={`bubble ${m.me ? 'me' : 'them'}`}>
                                        {/* Reply Context */}
                                        {m.replyTo && (
                                            <div className="reply-preview-bubble">
                                                <div className="reply-sender">{m.replyTo.sender}</div>
                                                <div className="reply-content">{m.replyTo.content}</div>
                                            </div>
                                        )}

                                        {m.attachments && m.attachments.map((file, idx) => (
                                            <div key={idx} className="attachment-preview">
                                                {file.type?.startsWith('image/') ? (
                                                    <img
                                                        src={getFullUrl(file.url)}
                                                        alt={file.name}
                                                        className="chat-img"
                                                        onClick={() => window.open(getFullUrl(file.url), '_blank')}
                                                    />
                                                ) : (
                                                    <a href={getFullUrl(file.url)} download={file.name} className="file-box" target="_blank" rel="noopener noreferrer">
                                                        <FiPaperclip />
                                                        <div className="file-info">
                                                            <span className="file-name">{file.name}</span>
                                                            <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                        {m.text && <div className="text">{m.text}</div>}
                                        <div className="meta">{m.who} • {m.ts}</div>

                                        {/* Hover Actions */}
                                        <div className="bubble-actions">
                                            <button
                                                className="action-btn reply"
                                                title="Reply"
                                                onClick={() => {
                                                    setReplyTo(m);
                                                    // Focus input
                                                    document.querySelector('.composer input[type="text"]')?.focus();
                                                }}
                                            >
                                                <FiCornerUpLeft />
                                            </button>
                                            {m.me && (
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => deleteMessage(m.id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {uploading && (
                                <div className="bubble me uploading">
                                    <div className="loading-dots">Uploading file...</div>
                                </div>
                            )}
                            <div ref={endRef}></div>
                        </div>

                        <div className="composer-wrapper">
                            {replyTo && (
                                <div className="reply-bar">
                                    <div className="reply-details">
                                        <div className="reply-title">Replying to {replyTo.who}</div>
                                        <div className="reply-text">{replyTo.text || 'File'}</div>
                                    </div>
                                    <button className="close-reply" onClick={() => setReplyTo(null)}><FiX /></button>
                                </div>
                            )}
                            <div className="composer">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={onFileSelected}
                                />
                                <button className="attach" onClick={handleFileClick} disabled={uploading}>
                                    <FiPaperclip />
                                </button>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="Type a message..."
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                                />
                                <button className="send" onClick={() => send()} disabled={uploading}><FiSend /> Send</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                        <FiSend size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <h3>Select a thread or start a new one</h3>
                    </div>
                )}
            </section>

            {/* New Message Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>New Message</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="user-list">
                            {users.map(user => (
                                <button key={user.id} className="user-item" onClick={() => startChat(user)}>
                                    <div className="user-avatar-small">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="user-details">
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-role">{user.role}</div>
                                    </div>
                                    <div className="role-badge">{user.role}</div>
                                </button>
                            ))}
                            {users.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No users found</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
