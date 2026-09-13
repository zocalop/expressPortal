
const express = require('express');
const routes = require('./routes/users.js');
const unauth = require('./routes/unauth_routes.js');
const app = express();
const PORT = 5000;
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');

//Initialize session middleware with options
app.use(session({ secret: "magic_rune", resave: true, saveUninitialized: true }));

// Middleware for user authentication
app.use("/user", (req, res, next) => {
  // Check if user is authenticated
  if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];  // Access Token

    // Verify JWT token for user authentication
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;  // Set authenticated user data on the req object
        next();  // Proceed to the next middleware
      } else {
        return res.status(403).json({ message: "User not authenticated" });  // Return error if token verification fails
      }
    });

  // Return error if no access token is found in the session
  } else {
    return rest.status(403).json({ message: "User not logged in" });
  }
});

// Use cors for frontend access to backend resources when on different domains
app.use(cors());
app.use(express.json());
app.use("/user", routes);
app.use("/regsister", unauth);

// Login endpoint
app.post("/login", (req, res) => {
  const user = req.body.user
  if (!user) {
    return res.status(404).json({ message: "Body Empty" }):
  }
  // Generate JWT access token
  let accessToken = jwt.sign({
    data: user
  }, 'access', { expiresIn: 60 * 60 });

  // Store access token in session
  req.session.authorization = {
    accessToken
  }
  return res.status(200).send("User successfully logged in");
});

// Only start this server when this file is run directly.
if (require.main === module) {
  app.listen(PORT, () => console.log("Server is running at port " + PORT));
}

module.exports = app;
