// backend/__tests__/recipe.integration.test.js

const request = require('supertest');
const app = require('../server'); // Assuming your server is exported from backend/server.js
const mongoose = require('mongoose');
const Recipe = require('../models/recipeModel'); 

// --- Setup Data (Must match your user data) ---
const testUser = {
    email: 'test@example.com',
    password: 'Password123',
};
const newRecipe = {
    title: 'Spicy Vegan Chili',
    description: 'A hearty chili with three kinds of beans.',
    ingredients: ['beans', 'tomatoes', 'chili powder'],
    steps: ['Sauté onions', 'Add everything else', 'Simmer'],
};
let authToken;
let recipeId; // To store the ID of the created recipe

// --- Setup/Teardown ---
beforeAll(async () => {
    // 1. Log in the test user to get a valid token
    const loginResponse = await request(app)
        .post('/api/users/login')
        .send(testUser);
    
    authToken = loginResponse.body.token;

    // 2. Ensure the database is clean for this user's recipes
    await Recipe.deleteMany({ user: loginResponse.body._id });
});

afterAll(async () => {
    // Clean up created recipe
    await Recipe.deleteMany({ _id: recipeId });
    // Close the MongoDB connection after all tests
    await mongoose.connection.close();
});

// 

describe('Recipe CRUD Operations (Private Routes)', () => {

    // Test 1: POST /api/recipes - Create a Recipe
    it('should allow a logged-in user to create a new recipe', async () => {
        const response = await request(app)
            .post('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newRecipe);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe(newRecipe.title);
        expect(response.body).toHaveProperty('user', mongoose.Types.ObjectId.isValid(response.body.user));

        recipeId = response.body._id; // Save ID for later tests
    });

    // Test 2: GET /api/recipes - Fetch Recipes
    it('should allow a logged-in user to fetch their own recipes', async () => {
        const response = await request(app)
            .get('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]._id).toBe(recipeId);
    });

    // Test 3: PUT /api/recipes/:id - Update Recipe
    it('should allow a logged-in user to update their recipe', async () => {
        const updatedTitle = 'Super Spicy Vegan Chili Updated';
        const response = await request(app)
            .put(`/api/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: updatedTitle });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedTitle);
    });

    // Test 4: DELETE /api/recipes/:id - Delete Recipe
    it('should allow a logged-in user to delete their recipe', async () => {
        const response = await request(app)
            .delete(`/api/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(recipeId);

        // Verify deletion
        const verify = await request(app)
            .get('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(verify.body.length).toBe(0);
    });

    // Test 5: Security Check - Deny access without token
    it('should return 401 when trying to create a recipe without a token', async () => {
        const response = await request(app)
            .post('/api/recipes')
            .send(newRecipe);

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Not authorized, no token');
    });

});