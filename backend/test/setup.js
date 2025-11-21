// test/setup.js

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Before any tests run, start the in-memory MongoDB server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// After all tests finish, stop the server and close the connection
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});