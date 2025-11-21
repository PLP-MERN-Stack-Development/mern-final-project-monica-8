// backend/__tests__/comment.integration.test.js

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Comment = require('../models/commentModel');
const Recipe = require('../models/recipeModel');

// --- Setup Data ---
const testUser = {
    email: 'test@example.com',
    password: 'Password123',
};
const commentText = 'This is a great recipe!';
let authToken;
let recipe; // To store a temporary recipe
let commentId; // To store the created comment ID

// --- Setup/Teardown ---
beforeAll(async () => {
    // 1. Log in the test user
    const loginResponse = await request(app)
        .post('/api/users/login')
        .send(testUser);
    
    authToken = loginResponse.body.token;
    const userId = loginResponse.body._id;

    // 2. Create a temporary recipe to attach comments to
    await Recipe.deleteMany({ user: userId });
    recipe = await Recipe.create({
        user: userId,
        title: 'Temp Comment Test',
        description: 'Temporary recipe for comment testing',
    });
});

afterAll(async () => {
    // Clean up
    await Recipe.deleteMany({ _id: recipe._id });
    await Comment.deleteMany({ recipe: recipe._id });
    await mongoose.connection.close();
});

// ------------------------------------------------------------------

describe('Comment CRUD Operations', () => {

    // Test 1: POST /api/comments/:recipeId - Create a Comment
    it('should allow a logged-in user to add a comment to a recipe', async () => {
        const response = await request(app)
            .post(`/api/comments/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ text: commentText });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.text).toBe(commentText);
        
        commentId = response.body._id; // Save ID for later tests
    });

    // Test 2: GET /api/comments/:recipeId - Fetch Comments
    it('should allow fetching all comments for a specific recipe (Public Route)', async () => {
        const response = await request(app)
            .get(`/api/comments/${recipe._id}`); // This route is public in your implementation

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].text).toBe(commentText);
    });

    // Test 3: PUT /api/comments/:id - Update Comment
    it('should allow a logged-in user to update their own comment', async () => {
        const updatedText = 'This recipe is absolutely fantastic!';
        const response = await request(app)
            .put(`/api/comments/${commentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ text: updatedText });

        expect(response.statusCode).toBe(200);
        expect(response.body.text).toBe(updatedText);
    });

    // Test 4: DELETE /api/comments/:id - Delete Comment
    it('should allow a logged-in user to delete their own comment', async () => {
        const response = await request(app)
            .delete(`/api/comments/${commentId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(commentId);

        // Verify deletion
        const verify = await request(app)
            .get(`/api/comments/${recipe._id}`);
        
        expect(verify.body.length).toBe(0);
    });

});