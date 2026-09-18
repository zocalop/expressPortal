
const jwt = require('jsonwebtoken');

// Middleware for user authentication
function authenticate(req, res, next) {
  // Check if user is authenticated
  if (req.session.authorization) {
    let token = req.session.authorization['accessToken'];  // Access Token

    // Verify JWT token for user authentication
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;  // Set authenticated user data on the req object
        next();  // Proceed to the next middleware
      } else {
        return res.status(403).send("User not authenticated");  // Return error if >
      }
    });

  // Return error if no access token is found in the session
  } else {
    return res.status(403).send("User not logged in");
  }
};

module.exports = authenticate;
