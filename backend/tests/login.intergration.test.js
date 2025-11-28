// backend/tests/login.intergration.test.js

const request = require('supertest');
const app = require('../server');
const User = require('../models/userModel');

describe('POST /api/users/login - Authentication Integration Tests', () => {
    const testUser = {
        name: 'Login Test User',
        email: `login${Date.now()}@test.com`,
        password: 'testpassword',
    };

    beforeAll(async () => {
        // Register user for testing login against valid credentials
        await request(app).post('/api/users').send(testUser);
    });

    afterAll(async () => {
        // Clean up the user
        await User.deleteOne({ email: testUser.email });
    });

    it('should return 200 and a token for valid credentials', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body.email).toBe(testUser.email);
    });

    it('should return 401 for incorrect password', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({ email: testUser.email, password: 'wrongpassword' })
            .expect(401);
        
        expect(response.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 401 for user that does not exist', async () => {
        await request(app)
            .post('/api/users/login')
            .send({ email: 'nonexistent@user.com', password: 'pass123' })
            .expect(401);
    });

    it('should return 400 for missing required fields (password)', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({ email: testUser.email }) // Missing password
            .expect(400);

        // FIX: Update assertion to match the actual controller message "Please enter email and password"
        expect(response.body.message).toMatch(/email and password/i);
    });

    it('should return 400 for missing required fields (email)', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({ password: testUser.password }) // Missing email
            .expect(400);
            
        // FIX: Update assertion to match the actual controller message "Please enter email and password"
        expect(response.body.message).toMatch(/email and password/i);
    });
});