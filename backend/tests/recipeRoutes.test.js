const request = require('supertest');
jest.setTimeout(30000); // Increase timeout for async operations
const mongoose = require('mongoose');
const  app  = require('../server');  
const Recipe = require('../models/recipeModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

describe('Recipe Routes', () => {
  let token, userId, tokenForAnotherUser, recipeIdToUpdate, recipeIdToDelete;

  /** SETUP - Create auth tokens via API (tests real routes) */
  beforeAll(async () => {
    // Register users via API (tests auth middleware)
    const ownerRes = await request(app)
      .post('/api/users')
      .send({ name: 'Owner', email: `owner${Date.now()}@test.com`, password: 'pass123' });
    token = ownerRes.body.token;
    userId = ownerRes.body._id;

    const otherRes = await request(app)
      .post('/api/users')
      .send({ name: 'Other', email: `other${Date.now()}@test.com`, password: 'pass456' });
    tokenForAnotherUser = otherRes.body.token;
  });

  /** CLEANUP - Global jest.setup.js handles collections */

  const validRecipe = {
    name: 'Test Recipe',
    ingredients: 'Flour, Water',
    category: 'Dinner',
    prepTime: 30
  };

  describe('POST /api/recipes', () => {
    it('should return 401 if no token provided', async () => {
      await request(app).post('/api/recipes').send(validRecipe).expect(401);
    });

    it('should return 400 if name missing', async () => {
      await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ingredients: 'test', category: 'Lunch' })
        .expect(400);
    });

    it('should create recipe - 201', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(validRecipe)
        .expect(201);

      expect(res.body.name).toBe(validRecipe.name);
      expect(res.body.user).toBeDefined();
      recipeIdToUpdate = res.body._id;  // Use this for PUT test
    });
  });

  describe('GET /api/recipes', () => {
    it('should return 401 if no token', async () => {
      await request(app).get('/api/recipes').expect(401);
    });

    it('should return user recipes', async () => {
      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);  // ✅ Flexible
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/recipes?category=Dinner')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.every(r => r.category === 'Dinner')).toBe(true);
    });
  });

  describe('PUT /api/recipes/:id', () => {
    it('should return 401 for unauthorized user', async () => {
      await request(app)
        .put(`/api/recipes/${recipeIdToUpdate}`)
        .set('Authorization', `Bearer ${tokenForAnotherUser}`)
        .send({ name: 'Hack Attempt' })
        .expect(401);
    });

    it('should update for owner', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeIdToUpdate}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Recipe', prepTime: 45 })
        .expect(200);

      expect(res.body.name).toBe('Updated Recipe');
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    beforeEach(async () => {
      // Create fresh recipe for DELETE test
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRecipe, name: 'To Delete' });
      recipeIdToDelete = res.body._id;
    });

    it('should return 401 for unauthorized', async () => {
      await request(app)
        .delete(`/api/recipes/${recipeIdToDelete}`)
        .set('Authorization', `Bearer ${tokenForAnotherUser}`)
        .expect(401);
    });

    it('should return 404 for invalid ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .delete(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should delete for owner', async () => {
      await request(app)
        .delete(`/api/recipes/${recipeIdToDelete}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
