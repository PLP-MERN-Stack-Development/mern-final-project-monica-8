// backend/test/setup.js (This is the file containing the beforeAll/afterAll hooks)
// backend/test/setup.js

const path = require('path');
// 🎯 CRITICAL FIX: Explicitly load environment variables 
// from the backend/.env file BEFORE any database logic runs.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); 

const { MongoMemoryServer } = require('mongodb-memory-server');
// ... rest of the code that uses MongoMemoryServer ...
let mongo;

beforeAll(async () => {
  // 1. Create In-Memory MongoDB Instance
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // 2. Connect to the database
  // 🎯 CRITICAL FIX: Add the timeout options here to prevent 10000ms buffering failure
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000, 
    socketTimeoutMS: 45000,
  });
  console.log('✅ Test DB Connected (In-Memory)');
});

afterAll(async () => {
  // 3. Disconnect and Stop the server
  await mongoose.disconnect();
  await mongo.stop();
  console.log('✅ Test DB Disconnected');
});

// Note: If you have a separate setup.js file for Jest's globalSetup, ensure 
// that file only handles loading dotenv or other global non-DB setup tasks, 
// and that your test files import this beforeAll/afterAll logic.