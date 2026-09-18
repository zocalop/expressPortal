
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const sinon = require('sinon');

const app = require('../index');
const db = require('../database');

test.beforeEach(() => {
  db.prepare('DELETE FROM cart_items').run();
  db.prepare('DELETE FROM users').run();
});

//test('POST /login returns 404 for a missing user', async () => {
//  const response = await request(app)

//    .get('/login');

//  assert.strictEqual(response.statusCode, 404);
//  assert.strictEqual(
//    response.text,
//      'You have no history here, Stranger.'
//  );
//})

test('GET /user/cart retrieves logged in user's cart', async () => {

});

test('PUT /user/cart updates the user cart', async () => {
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

test('DELETE /user', async () => {
  const response = await request(app)
    .delete('/user');

  assert.strictEqual(response.statusCode, 404);
  assert.strictEqual(
    response.text,
      'You have no history here, Stranger.'
  );
});
