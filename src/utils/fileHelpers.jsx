import React from 'react';
import {
    FaFilePdf,
    FaFileWord,
    FaFileImage,
    FaVideo,
    FaFileArchive,
    FaFileAlt,
} from 'react-icons/fa';

/**
 * Get appropriate icon component based on file extension
 * @param {string} fileName - Name of the file
 * @returns {JSX.Element} - Icon component
 */
export const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="file-icon default" />;

    const extension = fileName.split('.').pop().toLowerCase();

    switch (extension) {
        case 'pdf':
            return <FaFilePdf className="file-icon pdf" />;
        case 'doc':
        case 'docx':
            return <FaFileWord className="file-icon word" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return <FaFileImage className="file-icon image" />;
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
            return <FaVideo className="file-icon video" />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <FaFileArchive className="file-icon archive" />;
        default:
            return <FaFileAlt className="file-icon default" />;
    }
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMs = now - then;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
        return then.toLocaleDateString();
    }
};

/**
 * Get status color class based on status value
 * @param {string} status - Status value
 * @returns {string} - CSS class name
 */
export const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '-');

    switch (statusLower) {
        case 'completed':
        case 'done':
            return 'status-completed';
        case 'in-progress':
        case 'in_progress':
            return 'status-in-progress';
        case 'to-do':
        case 'todo':
        case 'not-started':
            return 'status-todo';
        case 'in-review':
        case 'review':
            return 'status-review';
        case 'blocked':
            return 'status-blocked';
        default:
            return 'status-default';
    }
};

/**
 * Get priority color class based on priority value
 * @param {string} priority - Priority value
 * @returns {string} - CSS class name
 */
export const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();

    switch (priorityLower) {
        case 'high':
        case 'urgent':
            return 'priority-high';
        case 'medium':
            return 'priority-medium';
        case 'low':
            return 'priority-low';
        default:
            return 'priority-default';
    }
};
