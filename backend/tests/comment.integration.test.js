// backend/tests/comment.integration.test.js

const request = require('supertest');
const app = require('../server'); 
const User = require('../models/userModel');
const Recipe = require('../models/recipeModel'); 
// Assuming a Comment model exists:
// const Comment = require('../models/commentModel');

describe('Comment API', () => {
    const testUser = {
        name: 'Commenter',
        email: `commenter${Date.now()}@test.com`,
        password: 'commentpass',
    };
    const testRecipe = {
        name: 'Comment Test Recipe',
        ingredients: 'Test',
        category: 'Test',
        prepTime: 10
    };

    let authToken;
    let recipeId;

    beforeAll(async () => {
        // 1. Register User & Get Token
        const userRes = await request(app)
            .post('/api/users')
            .send(testUser)
            .expect(201);
        authToken = userRes.body.token;

        // 2. Create Recipe (Requires Token)
        const recipeRes = await request(app)
            .post('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testRecipe)
            .expect(201);
        recipeId = recipeRes.body._id;

        console.log(`✅ Token ready`);
        console.log(`✅ Recipe ID for comments: ${recipeId}`);
    });

    afterAll(async () => {
        // Cleanup 
        await User.deleteOne({ email: testUser.email });
        await Recipe.deleteOne({ _id: recipeId });
    });

    it('POST /api/recipes/:id/comments - creates comment', async () => {
        const res = await request(app)
            .post(`/api/recipes/${recipeId}/comments`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ text: 'Great recipe!' })
            .expect(201); 

        expect(res.body).toHaveProperty('text', 'Great recipe!');
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('recipe', recipeId);
    });

    it('GET /api/recipes/:id/comments - lists comments', async () => {
        // First, ensure a comment exists (from the previous test or create one here)
        await request(app)
            .post(`/api/recipes/${recipeId}/comments`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ text: 'Another comment!' })
            .expect(201); 

        const res = await request(app)
            .get(`/api/recipes/${recipeId}/comments`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200); 

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2); // Should have at least the two comments created
        expect(res.body.every(c => c.recipe === recipeId)).toBe(true);
    });
});