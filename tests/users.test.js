
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

test('GET /user returns a list of users', async () => {
  const response = await request(app)
    .get('/user');

  assert.strictEqual(response.statusCode, 200);
  assert.ok(Array.isArray(response.body));
});

test('POST /user creates a new user with a cart', async () => {
  const createResponse = await request(app)
    .post('/user')
    .query({
      firstName: 'Test',
      lastName: 'User'
    })
    .send({
      cart: [
        {
          product_name: 'Test Potion',
          quantity: 2
        }
      ]
    });
  assert.strictEqual(createResponse.statusCode, 201);
  assert.strictEqual(createResponse.body.firstName, 'Test');
  assert.strictEqual(createResponse.body.lastName, 'User');

  const userId = createResponse.body.id
  const getResponse = await request(app)
    .get(`/user/${userId}`);

  assert.strictEqual(getResponse.statusCode, 200);
  assert.deepStrictEqual(getResponse.body.cart, [
    {
      product_name: 'Test Potion',
      quantity: 2
    }
  ]);
});

test('GET /user/:id returns 404 for a missing user', async () => {
  const response = await request(app)
    .get('/user/999999');

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(
    response.text,
      'You have no history here, Stranger.'
  );
})

test('PUT /user/:id updates the user cart', async () => {
  const createResponse = await request(app)
    .post('/user')
    .query({
      firstName: 'Cart',
      lastName: 'Tester'
    })
    .send({
      cart: [
        {
          product_name: 'Old Potion',
          quantity: 3
        }
      ]
    });

  const userId = createResponse.body.id;
  const updateResponse = await request(app)
    .put(`/user/${userId}`)
    .send({
      cart: [
        {
          product_name: 'New Potion',
          quantity: 3
        }
      ]
    });

  assert.strictEqual(updateResponse.statusCode, 200);
  assert.deepStrictEqual(updateResponse.body.cart, [
    {
      product_name: 'New Potion',
      quantity: 3
    }
  ]);
});

test('DELETE /user/:id deletes an existing user', async () => {
  const createResponse = await request(app)
    .post('/user')
    .query({
      firstName: 'Delete',
      lastName: 'Tester'
    })
    .send({
      cart: []
    });

    const userId = createResponse.body.id;
    const deleteResponse = await request(app)
      .delete(`/user/${userId}`);

    assert.strictEqual(deleteResponse.statusCode, 200);
    assert.strictEqual(
      deleteResponse.text,
        `Customer with id ${userId} deleted.`
    );

    const getResponse = await request(app)
      .get(`/user/${userId}`);

    assert.strictEqual(getResponse.statusCode, 404);
});

test('PUT /user/:id returns 404 for a missing user', async () => {
  const response = await request(app)
    .put('/user/999999')
    .send({
      cart: [
        {
          product_name: 'Test Potion',
          quantity: 1
        }
      ]
    });

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(
    response.text,
      'You have no history here, Stranger.'
  );
});

test('DELETE /user/:id returns 404 for a missing user', async () => {
  const response = await request(app)
    .delete('/user/999999');

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(
    response.text,
      'You have no history here, Stranger.'
  );
});
