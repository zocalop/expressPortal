
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const db = require('../database');
const createApp = require('../index.js');

test.beforeEach(() => {
  db.prepare('DELETE FROM cart_items').run();
  db.prepare('DELETE FROM users').run();

  db.prepare(`
    INSERT INTO users (id, firstName, lastName)
    VALUES (?, ?, ?)
  `).run(1, 'Booger', 'Fatpickle');

  db.prepare(`
    INSERT INTO cart_items (user_id, product_name, quantity)
    VALUES (?, ?, ?)
  `).run(1, 'gopher nuts', 2);
});

const fakeAuthenticate = (req, res, next) => {
  req.user = {
    user_id: 1
  };
  next();
};
const app = createApp(fakeAuthenticate);

test('POST /login returns 404 for a missing user', async () => {
  const response = await request(app)
    .post('/login')
    .send({
      username: 1,
      password: 'Creamwype'
    })

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(
    response.text,
      'Password not found'
  );
});

test('GET / retrieves all users', async () => {
  const response = await request(app)
    .get('/user')

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.body, [
    {
      id: 1,
      firstName: 'Booger',
      lastName: 'Fatpickle'
    }
  ]);
});

test('GET /user/cart retrieves logged in user cart', async () => {
  const response = await request(app)
    .get('/user/cart')

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.body, [
    {
      product_name: 'gopher nuts',
      quantity: 2
    }
  ])
});

test('PUT /user/cart updates the user cart', async () => {
  const createResponse = await request(app)
    .put('/user/cart')
    .send({
      cart: [
        {
          product_name: 'Old Potion',
          quantity: 3
        }
      ]
    });

  assert.strictEqual(createResponse.statusCode, 200);
  assert.deepStrictEqual(createResponse.body, [
    {
      product_name: 'Old Potion',
      quantity: 3
    }
  ])

  const updateResponse = await request(app)
    .put('/user/cart')
    .send({
      cart: [
        {
          product_name: 'New Potion',
          quantity: 1
        }
      ]
    });

  console.log(updateResponse.text);
  assert.strictEqual(updateResponse.statusCode, 200);
  assert.deepStrictEqual(updateResponse.body, [
    {
      product_name: 'New Potion',
      quantity: 1
    }
  ]);
});

test('DELETE /user', async () => {
  const response = await request(app)
    .delete('/user');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(
    response.text,
      'Customer with id 1 deleted.'
  );
});
