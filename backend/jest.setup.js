// backend/jest.setup.js

const mongoose = require('mongoose');

// Connect function ensures we only try to connect if we aren't already connected.
const connectTestDB = async () => {
    // Check if Mongoose is connected (state 1 or 2) or connecting (state 2)
    if (mongoose.connection.readyState === 0) {
        // This connects to the test DB defined in your environment vars
        await mongoose.connect(process.env.MONGO_URI, {}); 
        console.log('✅ Test DB connected');
    }
};

const closeHandles = async () => {
    // Only close if there's an active connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('✅ Test DB connection closed');
    }
};

// Global setup: Connect to the database once before all tests
beforeAll(async () => {
    await connectTestDB();
});

// Global teardown: Close DB connection after all tests are done
afterAll(async () => {
    await closeHandles();
});