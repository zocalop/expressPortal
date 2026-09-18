
const express = require('express');
const routes = require('./routes/users.js');
const unauth = require('./routes/unauth_routes.js');
//const authenticate = require('./middleware/authenticate.js');
//const PORT = 5000;
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const db = require('./database');

const createApp = (authenticate) => {

  const app = express();

  // Use cors for frontend access to backend resources when on different domains
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));

  app.use(express.json());

  //Initialize session middleware with options
  app.use(session({ secret: "magic_rune", resave: true, saveUninitialized: true }));

  app.use("/user", authenticate);
  app.use("/user", routes);
  app.use("/register", unauth);

  // Login endpoint
  app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    if (!username) {
      return res.status(404).send("Enter Username");
      }
    if (!password) {
      return res.status(404).send("Enter Password");
    }

    // Retrieve user from db
    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(username);
    if (!user) {
      return res.status(404).send("Username not found");
    }
    const pass = db
      .prepare("SELECT id FROM users WHERE id = ? AND lastName = ?")
      .get(username, password);
    if (!pass) {
      return res.status(404).send("Password not found");
    }
    const user_id = user.id;

    // Generate JWT access token
    let accessToken = jwt.sign({
      user_id: user_id
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token in session
    req.session.authorization = {
      accessToken
    }
    return res.status(200).send("User successfully logged in");
  });

  return app;

};

module.exports = createApp;
