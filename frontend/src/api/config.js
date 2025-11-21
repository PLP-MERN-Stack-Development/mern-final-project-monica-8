// frontend/src/api/config.js

import axios from 'axios';

// The base URL for your Express backend (Port 5000)
const api = axios.create({
  // Ensure this URL matches your running backend server's address
  baseURL: 'http://localhost:5000/api', 
});

export default api;