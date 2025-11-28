// backend/server.js

const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');

// FIX 1: Only connect to the database if NOT in a test environment
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Main Routes
app.use('/api/users', require('./server/routes/userRoutes')); 
app.use('/api/recipes', require('./server/routes/recipeRoutes'));

// Error handler 
// The errorMiddleware file is in './middleware/errorMiddleware', which is correct relative to server.js
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;

// Conditional Listening: Only start the server if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// CRITICAL FIX: Export ONLY the app instance for Supertest
module.exports = app;