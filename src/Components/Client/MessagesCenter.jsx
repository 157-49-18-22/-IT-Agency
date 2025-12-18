import React, { useState } from 'react';
import { FaPaperPlane, FaUser, FaUserTie } from 'react-icons/fa';
import './ClientPortal.css';

const MessagesCenter = () => {
    const [messages] = useState([
        { id: 1, sender: 'admin', text: 'Welcome to your project! We\'re excited to work with you.', time: '2024-01-01 10:00' },
        { id: 2, sender: 'client', text: 'Thank you! Looking forward to seeing the designs.', time: '2024-01-01 10:15' },
        { id: 3, sender: 'admin', text: 'The wireframes are ready for your review.', time: '2024-01-08 14:30' },
        { id: 4, sender: 'client', text: 'Great! I\'ll review them today.', time: '2024-01-08 15:00' },
        { id: 5, sender: 'admin', text: 'Development is progressing well. Demo will be ready soon.', time: '2024-02-10 11:00' }
    ]);

    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (!newMessage.trim()) return;
        alert(`Message sent: ${newMessage}`);
        setNewMessage('');
    };

    return (
        <div className="messages-page">
            <div className="page-header">
                <h1>Messages</h1>
                <p>Communicate with your project team</p>
            </div>

            <div className="messages-container">
                <div className="messages-list">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message-item ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === 'admin' ? <FaUserTie /> : <FaUser />}
                            </div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-sender">
                                        {msg.sender === 'admin' ? 'Project Manager' : 'You'}
                                    </span>
                                    <span className="message-time">
                                        {new Date(msg.time).toLocaleString()}
                                    </span>
                                </div>
                                <div className="message-text">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="message-input-container">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows="3"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    ></textarea>
                    <button className="btn-send" onClick={handleSend}>
                        <FaPaperPlane /> Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesCenter;
