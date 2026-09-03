
const express = require('express');
const routes = require('./routes/users.js');
const app = express();
const PORT = 5000;

const Database = require('better-sqlite3');
const db = new Database('users.db');

const cors = require('cors');

// Use JSON parsing middleware and user routes
app.use(cors());
app.use(express.json());
app.use("/user", routes);

app.listen(PORT, () => console.log("Server is running at port " + PORT));

module.exports = db;
