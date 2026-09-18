
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

const app = require('../production.js');
const db = require('../database');

test.beforeEach(() => {
  db.prepare('DELETE FROM cart_items').run(),
  db.prepare('DELETE FROM users').run()
});

test('registers a user, logs in, authenticates, and retrieves a list of all users', async () => {
//  const user = db.prepare(`
//    INSERT INTO users (firstName, lastName)
//    VALUES (?, ?)
//  `).run('Test', 'User');

  const agent = request.agent(app);

  const createResponse = await agent
    .post('/register')
    .query({
      firstName: 'Booger',
      lastName: 'Fatpickle'
    })
    .send({
      cart: [
        {
          product_name: 'Weiner Potion',
          quantity: 1
        }
      ]
    });

  assert.strictEqual(createResponse.statusCode, 201);

  const userId = createResponse.body.id;
  const pass = createResponse.body.lastName;

  const loginResponse = await agent
    .post('/login')
    .send({
      username: userId,
      password: pass
    });

  assert.strictEqual(loginResponse.statusCode, 200);

  const cartResponse = await agent
    .get('/user/cart');

  assert.strictEqual(cartResponse.statusCode, 200);
  assert.deepStrictEqual(cartResponse.body, [
    {
      product_name: 'Weiner Potion',
      quantity: 1
    }
  ]);
});
