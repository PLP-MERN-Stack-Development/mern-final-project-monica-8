// __tests__/userRoutes.test.js

const request = require('supertest');
const app = require('../server'); // Import your Express app instance
const User = require('../models/userModel');

// A placeholder user for testing
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

// Clean up the User collection before each test
beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/users', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(testUser);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('token');
    expect(response.body.email).toBe(testUser.email);
    // Ensure the password is NOT returned
    expect(response.body).not.toHaveProperty('password'); 
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: testUser.email }); // Missing name and password

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Please include all fields.');
  });
});