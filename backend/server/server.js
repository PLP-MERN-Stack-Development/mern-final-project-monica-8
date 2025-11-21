// server.js

// 1. Core Imports
const express = require('express');
const dotenv = require('dotenv').config(); 
const colors = require('colors'); 
const connectDB = require('./config/db'); 
const { errorHandler } = require('./middleware/errorMiddleware'); 

// Set the port. 
const PORT = process.env.PORT || 5000;

// 2. Database Connection
connectDB();

// 3. Initialize Express App
const app = express();

// 4. Essential Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); // For form data


// 5. Define Routes

// User Routes
app.use('/api/users', require('./routes/userRoutes'));

// Recipe Routes 
app.use('/api/recipes', require('./routes/recipeRoutes'));

// Dedicated Comment Routes 
app.use('/api/comments', require('./routes/commentRoutes'));

// 6. Error Handling Middleware
app.use(errorHandler);

// 7. Start the Server 
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000', 
        methods: ["GET", "POST"]
    }
});

// 8. Socket.io Handler 
require('./socketHandler')(io);

// 9. Listen on the new HTTP server
server.listen(PORT, () => console.log(`Server started on port ${PORT} (HTTP & Socket.io)`.cyan.bold));