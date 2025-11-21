// config/db.js

const mongoose = require('mongoose');
// You also need to require 'colors' here if you want to use the .cyan.underline.bold styling
// const colors = require('colors'); 

const connectDB = async () => {
    try {
        // CORRECT: Pass the environment variable directly.
        // Node.js already loaded this value from your .env file via dotenv.config() in server.js.
        const conn = await mongoose.connect(process.env.MONGO_URI); 

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    } catch (error) {
        // Make sure to handle the case where the URI is missing or incorrect
        console.error(`Error: ${error.message}`.red.underline.bold);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;