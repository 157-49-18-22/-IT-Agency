import { API_URL } from '../config/endpoints';

/**
 * Constructs a full URL for an image/file path.
 * Handles absolute URLs, data URLs, and relative backend paths.
 * 
 * @param {string} path - The relative or absolute path of the image/file
 * @returns {string|null} The full URL or null if path is empty
 */
export const getFullUrl = (path) => {
    if (!path) return null;
    path = path.trim();
    // If it's already a full URL or data URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }

    // Remove '/api' from the end of API_URL to get the base backend URL
    const baseUrl = API_URL.replace(/\/api$/, '');

    // Ensure path starts with a single forward slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};
