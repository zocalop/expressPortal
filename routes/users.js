
const express = require('express');
const router = express.Router();

const db = require('../database');

// GET request: Retrieve all users without cart
router.get("/", (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.send(users);
});

// GET request: Retrieve one user with Cart
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare(`
    SELECT id, firstName, lastName
    FROM users
    WHERE id = ?
  `).get(id);
  if (!user) {
    return res.status(404).send(
      "You have no history here, Stranger."
    );
  }

  const cart = db.prepare(`
    SELECT product_name, quantity
    FROM cart_items
    WHERE user_id = ?
  `).all(id);

  user.cart = cart;

  res.json(user);
});

// PUT request: Update user cart
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

/*let filtered_users = users.filter((user) => user.id === id);
  if (filtered_users.length > 0) {
    let filtered_user = filtered_users[0];
    let cart = req.body.cart;
    if (cart) {
      filtered_user.cart = cart;
    }
    users = users.filter((user) => user.id != id);
    users.push(filtered_user);
    fs.writeFileSync(
      './routes/users.json',
      JSON.stringify(users, null, 2)
    );
    res.status(201).json(filtered_user);
  } else {
    res.send("You have no history here, stranger.");
  }*/

  const cart = req.body.cart || [];
  const user = db.prepare(`
    SELECT *
    FROM users
    WHERE id = ?
  `).get(id);
  if (!user) {
    return res.status(404).send(
      "You have no history here, Stranger."
    );
  }

  db.prepare(`
    DELETE FROM cart_items
    WHERE user_id = ?
  `).run(id);

  const insertCartItem = db.prepare(`
    INSERT INTO cart_items (user_id, product_name, quantity)
    VALUES (?, ?, ?)
  `);

  const updateCart = db.transaction((cart) => {
    for (const item of cart) {
      insertCartItem.run(
        id,
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
  `).all(id);
   user.cart = updatedCart;

  res.status(200).json(user);
});

// DELETE request: Delete user
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
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
