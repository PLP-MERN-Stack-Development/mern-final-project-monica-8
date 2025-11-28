// tests/recipe.integration.test.js

const request = require('supertest');
const  app  = require('../server'); // CRITICAL: Import the raw Express app instance 'app'

const testUser = { 
    name: 'Recipe Test User', 
    email: 'recipe.test@example.com', 
    password: 'Password123!' 
};
let authToken;
// Remove 'let server;'

// --- SETUP AND TEARDOWN HOOKS ---
beforeAll(async () => {
    // 1. Register User
    await request(app)
        .post('/api/users')
        .send(testUser);

    // 2. Log In User & Get Token
    const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password });

    if (loginRes.status !== 200) {
        console.error("Setup Failed: Login failed for recipe test suite.", loginRes.body);
        // Throwing the error here prevents the rest of the tests from running.
        throw new Error(`Login failed with status ${loginRes.statusCode}`); 
    }

    authToken = loginRes.body.token;
    console.log('✅ Token ready');
});



describe('Recipe API', () => {

    it('POST /api/recipes - creates recipe', async () => {
        const newRecipe = {
            // CRITICAL FIX: The controller requires name, ingredients, category, and prepTime.
            // Assuming 'title' maps to 'name' or needs to be replaced by 'name' as per the controller/model.
            // Assuming 'description' is not strictly required.
            name: 'Test Recipe Title',
            ingredients: ['flour', 'sugar'],
            category: 'Baking',         // <--- ADDED REQUIRED FIELD
            prepTime: 45                // <--- ADDED REQUIRED FIELD
        };

        const res = await request(app) // Use 'app'
            .post('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`) 
            .send(newRecipe);

        // This expectation should now pass with status 201
        expect(res.status).toBe(201); 
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('name', 'Test Recipe Title');
    });

    it('GET /api/recipes - lists recipes', async () => {
        const res = await request(app) // Use 'app'
            .get('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`); 

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});