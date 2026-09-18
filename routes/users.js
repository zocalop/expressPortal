
const express = require('express');
const router = express.Router();

const db = require('../database');

// GET request: Retrieve all users without cart
router.get("/", (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.send(users);
});

// GET request: Retrieve one user's Cart
router.get("/cart", (req, res) => {
  const user_id = req.user.user_id;

  const cart = db.prepare(`
    SELECT product_name, quantity
    FROM cart_items
    WHERE user_id = ?
  `).all(user_id);

  res.json(cart);
});

// PUT request: Update user cart
router.put("/cart", (req, res) => {
  const user_id = req.user.user_id;

  const cart = req.body.cart || [];

  db.prepare(`
    DELETE FROM cart_items
    WHERE user_id = ?
  `).run(user_id);

  const insertCartItem = db.prepare(`
    INSERT INTO cart_items (user_id, product_name, quantity)
    VALUES (?, ?, ?)
  `);

  const updateCart = db.transaction((cart) => {
    for (const item of cart) {
      insertCartItem.run(
        user_id,
        item.product_name,
        item.quantity
      );
    }
  });
  updateCart(cart);

  const updatedCart = db.prepare(`
    SELECT product_name, quantity
    FROM cart_items
    WHERE user_id = ?
  `).all(user_id);

  res.status(200).json(updatedCart);
});

// DELETE request: Delete user
router.delete("/", (req, res) => {
  const id = req.user.user_id
  const result = db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `).run(id);
  if (result.changes === 0) {
    return res.status(404).send(
      "You have no history here, Stranger."
    );
  }
  res.status(200).send(
    `Customer with id ${id} deleted.`
  );
});

module.exports = router;
