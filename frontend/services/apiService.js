// --- Frontend API Service Layer ---
// This file is meant to be used in your React application (e.g., inside src/services or src/api)
// It uses standard Fetch API for simplicity.

const API_URL = '/api';

/**
 * Utility function to get the current user's token from local storage.
 * @returns {string | null} The JWT token or null.
 */
const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || null;
};

/**
 * Base function for authenticated API calls.
 * @param {string} endpoint The URL path (e.g., '/recipes').
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {object | null} data The request body data.
 * @returns {Promise<object>} The response data.
 */
const authFetch = async (endpoint, method = 'GET', data = null) => {
    const token = getToken();
    if (!token && method !== 'POST' && endpoint !== '/users') {
        throw new Error('Not authorized, missing token.');
    }

    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
        // Handle server-side errors (400, 401, 404, 500 etc.)
        throw new Error(responseData.message || `API call failed with status ${response.status}`);
    }

    return responseData;
};

// --- USER AUTH SERVICES ---

export const registerUser = (userData) => {
    return authFetch('/users', 'POST', userData);
};

export const loginUser = async (userData) => {
    const data = await authFetch('/users/login', 'POST', userData);
    
    // Store user data (including token) in localStorage upon successful login
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

export const logoutUser = () => {
    localStorage.removeItem('user');
};

// --- RECIPE CRUD SERVICES ---

export const getRecipes = () => {
    return authFetch('/recipes'); // Default method is GET
};

export const createRecipe = (recipeData) => {
    return authFetch('/recipes', 'POST', recipeData);
};

export const updateRecipe = (recipeId, recipeData) => {
    return authFetch(`/recipes/${recipeId}`, 'PUT', recipeData);
};

export const deleteRecipe = (recipeId) => {
    return authFetch(`/recipes/${recipeId}`, 'DELETE');
};


// --- COMMENT CRUD SERVICES ---

export const getComments = (recipeId) => {
    return authFetch(`/recipes/${recipeId}/comments`); // Public, but uses authFetch which works with/without token
};

export const createComment = (recipeId, commentText) => {
    return authFetch(`/recipes/${recipeId}/comments`, 'POST', { text: commentText });
};

export const updateComment = (recipeId, commentId, commentText) => {
    return authFetch(`/recipes/${recipeId}/comments/${commentId}`, 'PUT', { text: commentText });
};

export const deleteComment = (recipeId, commentId) => {
    return authFetch(`/recipes/${recipeId}/comments/${commentId}`, 'DELETE');
};

// Optional: Function to retrieve user info from storage for initial state
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};