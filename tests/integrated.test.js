
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

const app = require('../index');
const db = require('../database');

test.beforeEach(() => {
  db.prepare('DELETE FROM cart_items').run(),
  db.prepare('DELETE FROM users').run()
});

test('registers a user, logs in, authenticates, and retrieves a list of all users', async () => {
  const user = db.prepare(`
    INSERT INTO users (firstName, lastName)
    VALUES (?, ?)
  `).run('Test', 'User');

  const agent = request.agent(app);

  await agent
    .post('/login')
    .send({
      username: user.lastInsertRowid,
      password: 'User'
    });

  const response = await agent
    .get('/user');

  assert.strictEqual(response.statusCode, 200);
  assert.ok(Array.isArray(response.body));

  const userId = user.id

});
