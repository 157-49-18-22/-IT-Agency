import React, { useState, useEffect } from 'react';
import {
    FaBell,
    FaCheck,
    FaCheckDouble,
    FaTrash,
    FaExclamationCircle,
    FaInfoCircle,
    FaCheckCircle,
    FaTimes
} from 'react-icons/fa';
import { notificationsAPI } from '../services/api';
import './NotificationsCenter.css';

const NotificationsCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter === 'unread') params.isRead = false;
            if (filter === 'read') params.isRead = true;

            const response = await notificationsAPI.getNotifications(params);
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationsAPI.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationsAPI.deleteNotification(id);
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'error':
                return <FaExclamationCircle className="notif-icon error" />;
            case 'success':
                return <FaCheckCircle className="notif-icon success" />;
            case 'warning':
                return <FaExclamationCircle className="notif-icon warning" />;
            default:
                return <FaInfoCircle className="notif-icon info" />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';

        return Math.floor(seconds) + ' seconds ago';
    };

    if (loading) {
        return (
            <div className="notifications-loading">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="notifications-center">
            {/* Header */}
            <div className="notifications-header">
                <div className="header-left">
                    <FaBell className="header-icon" />
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
                <div className="header-actions">
                    <button
                        className="btn-mark-all-read"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        <FaCheckDouble /> Mark all as read
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="notifications-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read
                </button>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <FaBell className="empty-icon" />
                        <p>No notifications to display</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        >
                            <div className="notification-icon-wrapper">
                                {getNotificationIcon(notification.type)}
                            </div>

                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4>{notification.title}</h4>
                                    <span className="notification-time">
                                        {getTimeAgo(notification.createdAt)}
                                    </span>
                                </div>

                                <p className="notification-message">{notification.message}</p>

                                {notification.link && (
                                    <a href={notification.link} className="notification-link">
                                        View details →
                                    </a>
                                )}

                                <div className="notification-meta">
                                    <span className={`notification-type ${notification.type}`}>
                                        {notification.type}
                                    </span>
                                    {notification.priority !== 'normal' && (
                                        <span className={`notification-priority ${notification.priority}`}>
                                            {notification.priority}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="notification-actions">
                                {!notification.isRead && (
                                    <button
                                        className="action-btn mark-read"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        <FaCheck />
                                    </button>
                                )}
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(notification.id)}
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsCenter;
