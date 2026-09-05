
const express = require('express');
const routes = require('./routes/users.js');
const app = express();
const PORT = 5000;

const cors = require('cors');

// Use cors for frontend access to backend resources when on different domains
app.use(cors());
app.use(express.json());
app.use("/user", routes);

// Only start this server when this file is run directly.
if (require.main === module) {
  app.listen(PORT, () => console.log("Server is running at port " + PORT));
}

module.exports = app;
