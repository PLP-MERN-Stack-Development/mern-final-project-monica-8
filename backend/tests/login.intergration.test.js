const request = require('supertest');
const app = require('../server'); // Assuming your main Express app is exported from server.js

// Mock user data for testing
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123',
};
const incorrectPasswordUser = {
  email: 'test@example.com',
  password: 'WrongPassword',
};
const nonexistentUser = {
  email: 'nonexistent@example.com',
  password: 'AnyPassword',
};

// NOTE: Before these tests can run successfully, you MUST have a user with 
// the email 'test@example.com' and password 'TestPassword123' registered 
// in your MongoDB database.

describe('POST /api/users/login', () => {
  // Test Case 1: Successful Login
  it('should return 200 and a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send(testUser);

    expect(response.statusCode).toBe(200);
    // The response body should contain the user details and a token
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('email', testUser.email);
  });

  // Test Case 2: Login with Incorrect Password
  it('should return 401 for incorrect password', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send(incorrectPasswordUser);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  // Test Case 3: Login with Nonexistent User
  it('should return 401 for a user that does not exist', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send(nonexistentUser);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  // Test Case 4: Login with Missing Data (e.g., missing email)
  it('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ password: testUser.password }); // Missing email

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('Please fill in all fields');
  });
});