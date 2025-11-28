// backend/test/teardown.js

const mongoose = require('mongoose');

// Jest's globalTeardown function must export a single function
module.exports = async () => {
    try {
        await mongoose.connection.close();
        console.log('Test DB connection closed.');
    } catch (error) {
        console.error('Error closing Test DB connection:', error);
        // Optionally throw the error
        throw error;
    }
};