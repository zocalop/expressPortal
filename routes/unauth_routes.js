
const express = require('express');
const unauth_router = express.Router();
const db = require('../database');

// POST: Create user
unauth_router.post("/", (req, res) => {
  const { firstName, lastName } = req.query;
  const cart = req.body.cart || [];

  const insertUser = db.prepare(`
    INSERT INTO users (firstName, lastName)
    VALUES (?, ?)
  `);
  const result = insertUser.run(firstName, lastName);
  const userId = result.lastInsertRowid;
  const newUser = db.prepare(`
    SELECT *
    FROM users
    WHERE id = ?
  `).get(userId);

  const insertCartItem = db.prepare(`
    INSERT INTO cart_items (user_id, product_name, quantity)
    VALUES (?, ?, ?)
  `);
  const addCartItems = db.transaction((cart) => {
    for (const item of cart) {
      insertCartItem.run(
        userId,
        item.product_name,
        item.quantity
      );
    }
  });
  addCartItems(cart);

  res.status(201).json(newUser);
});

module.exports = unauth_router;
