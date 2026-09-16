
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

const app = require('../index');
const db = require('../database');

test.beforeEach(() => {
  db.prepare('DELETE FROM cart_items').run();
  db.prepare('DELETE FROM users').run();
});


test('POST / creates a new user with cart', async () => {
  const createResponse = await request(app)
    .post('/register')
    .query({
      firstName: 'Test',
      lastName: 'User'
    })
    .send({
      cart: [
        {
          product_name: 'Test Potion',
          quantity: 3
        }
      ]
    })

  assert.strictEqual(createResponse.statusCode, 201);
  assert.strictEqual(createResponse.body.firstName, 'Test');
  assert.strictEqual(createResponse.body.lastName, 'User');

});
