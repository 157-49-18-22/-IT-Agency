import React, { useMemo, useRef, useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiSend, FiPaperclip, FiUser, FiCheckCircle, FiPlus, FiX } from 'react-icons/fi';
import './Messages.css';
import { messageAPI, teamAPI, userAPI } from '../services/api';

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
            const response = await messageAPI.getMessages();
            console.log('📨 Fetched messages response:', response.data);

            // Backend returns { success: true, data: [...] }
            const messages = response.data?.data || [];
            console.log('📨 Total messages:', messages.length);

            // Group messages by thread ID to Create unique conversation entries
            const groupedThreads = {};
            const groupedMessages = {};

            const rawMessages = Array.isArray(messages) ? messages : [];

            // We need to know current user ID to determine 'me'
            const storedUser = localStorage.getItem('user');
            const currentUserId = storedUser ? JSON.parse(storedUser).id : null;
            console.log('👤 Current user ID:', currentUserId);

            rawMessages.forEach(msg => {
                console.log('Processing message:', {
                    id: msg.id,
                    thread: msg.thread,
                    sender: msg.sender?.name,
                    senderId: msg.senderId,
                    content: msg.content?.substring(0, 50),
                    recipientDetails: msg.recipientDetails
                });

                // Thread Grouping - update last message to show most recent
                if (!groupedThreads[msg.thread]) {
                    // Determine who to show in the thread title
                    // If I sent this message, show the recipient's name
                    // If I received this message, show the sender's name
                    let threadTitle = 'Unknown';
                    let threadParticipants = [];

                    if (msg.senderId === currentUserId) {
                        // I sent this message, so show recipient(s)
                        if (msg.recipientDetails && msg.recipientDetails.length > 0) {
                            // Show the first recipient's name (for 1-on-1 chats)
                            threadTitle = msg.recipientDetails[0].name;
                            threadParticipants = ['You', msg.recipientDetails[0].name];
                        } else if (msg.recipients && msg.recipients.length > 0) {
                            // Fallback if recipientDetails not available
                            threadTitle = `User ${msg.recipients[0]}`;
                            threadParticipants = ['You', `User ${msg.recipients[0]}`];
                        }
                    } else {
                        // I received this message, so show sender
                        threadTitle = msg.sender?.name || 'Unknown';
                        threadParticipants = [msg.sender?.name, 'You'];
                    }

                    groupedThreads[msg.thread] = {
                        id: msg.thread,
                        title: threadTitle,
                        last: msg.content,
                        unread: 0,
                        participants: threadParticipants,
                        ts: msg.createdAt,
                        recipientIds: msg.recipients || [] // Store recipient IDs for later use
                    };
                } else {
                    // Update to show latest message
                    const existingThread = groupedThreads[msg.thread];
                    if (new Date(msg.createdAt) > new Date(existingThread.ts)) {
                        existingThread.last = msg.content;
                        existingThread.ts = msg.createdAt;
                    }
                }

                // Message Store Grouping
                if (!groupedMessages[msg.thread]) {
                    groupedMessages[msg.thread] = [];
                }

                groupedMessages[msg.thread].push({
                    id: msg.id,
                    who: msg.sender?.name || 'Unknown',
                    me: currentUserId ? (msg.senderId === currentUserId) : false,
                    text: msg.content,
                    ts: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    rawTs: msg.createdAt // Store for sorting
                });
            });

            // Sort messages in each thread by time (Oldest First)
            Object.keys(groupedMessages).forEach(threadId => {
                groupedMessages[threadId].sort((a, b) => new Date(a.rawTs) - new Date(b.rawTs));
            });

            console.log('📋 Grouped threads:', Object.keys(groupedThreads).length);
            console.log('💬 Grouped messages:', groupedMessages);

            setThreads(Object.values(groupedThreads));
            setStore(groupedMessages);

            // If we have threads and no active selection, select first
            const threadList = Object.values(groupedThreads);
            if (threadList.length > 0 && !activeId) {
                setActiveId(threadList[0].id);
                console.log('✅ Auto-selected first thread:', threadList[0].id);
            }
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const send = async () => {
        if (!text.trim()) return;

        console.log('📤 Sending message...', {
            activeId,
            text: text.substring(0, 50),
            threadCount: threads.length
        });

        try {
            // Prepare Payload
            let payload = { content: text, thread: activeId };
            const currentThread = threads.find(t => t.id === activeId);

            // If this is a new local thread (not in DB yet), send recipientId instead of thread ID
            if (typeof activeId === 'string' && activeId.startsWith('new-')) {
                if (currentThread && currentThread.recipientId) {
                    payload = { content: text, recipient: currentThread.recipientId };
                    console.log('📤 New thread - sending to recipient:', currentThread.recipientId);
                }
            } else {
                console.log('📤 Existing thread:', activeId);
            }

            console.log('📤 Payload:', payload);
            const response = await messageAPI.sendMessage(payload);
            console.log('✅ Message sent successfully:', response.data);

            // Re-fetch to get real ID and persistence
            await fetchMessages();
            setText('');

        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Error sending message: ' + (error.response?.data?.message || error.message));
        }
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
        // Check if we already have a thread with this user (by name for now, ideally by ID)
        const existing = threads.find(t => t.title === user.name || t.participants.includes(user.name));

        if (existing) {
            setActiveId(existing.id);
            setShowModal(false);
        } else {
            // Create a new temporary thread
            const newThreadId = `new-${Date.now()}`;
            const newThread = {
                id: newThreadId,
                title: user.name,
                last: 'Start a conversation',
                unread: 0,
                participants: ['You', user.name],
                recipientId: user.id // Store ID to send first message
            };
            setThreads([newThread, ...threads]);
            setActiveId(newThreadId);
            setStore(prev => ({ ...prev, [newThreadId]: [] })); // Init empty messages
            setShowModal(false);
        }
    };

    if (loading) return <div className="loading">Loading messages...</div>;

    return (
        <div className="messages">
            <aside className="left">
                <div className="left-head">
                    <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="title">Messages</div>
                        <button className="new-chat-btn" onClick={() => setShowModal(true)} title="New Message">
                            <FiPlus />
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
                                <div key={m.id} className={`bubble ${m.me ? 'me' : 'them'}`}>
                                    <div className="text">{m.text}</div>
                                    <div className="meta">{m.who} • {m.ts}</div>
                                </div>
                            ))}
                            <div ref={endRef}></div>
                        </div>

                        <div className="composer">
                            <button className="attach"><FiPaperclip /></button>
                            <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                            <button className="send" onClick={send}><FiSend /> Send</button>
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
