// backend/server.js

const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db'); 
const errorHandler = require('./middleware/errorMiddleware');
const PORT = process.env.PORT || 5000;

// Connect to the database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', require('./server/routes/userRoutes')); 
app.use('/api/recipes', require('./server/routes/recipeRoutes'));

// Error handler (Must be last middleware)
app.use(errorHandler); // This now receives a function

// Start Server: Only start listening if NOT in the test environment.
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the app instance for testing purposes (Supertest)
module.exports = app;