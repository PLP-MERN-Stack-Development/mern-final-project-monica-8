// backend/tests/userRoutes.test.js

const request = require('supertest');
const app = require('../server'); 
const User = require('../models/userModel');
// const jwt = require('jsonwebtoken'); // Not strictly needed here

describe('POST /api/users', () => {
    // Define a standard user object for testing registration/login
    const newUser = {
        name: 'Test User Register',
        email: `register${Date.now()}@test.com`,
        password: 'password123',
    };

    // Clean up the created user after the suite runs
    afterAll(async () => {
        await User.deleteOne({ email: newUser.email });
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send(newUser)
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe(newUser.email);
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ email: 'test@fail.com' }) // Missing name and password
            .expect(400);

        // FIX: Update assertion to match the actual controller message "Please include all fields"
        expect(response.body.message).toMatch(/all fields/i); 
    });

    it('should return 400 if user already exists', async () => {
        // Ensure the user exists from the first test
        const existingUser = { ...newUser, email: `existing${Date.now()}@test.com` };
        await request(app).post('/api/users').send(existingUser).expect(201);

        const res = await request(app)
            .post('/api/users')
            .send(existingUser)
            .expect(400);
        
        expect(res.body.message).toMatch(/already exists/i);
    });
});