
//import Express.js library
const express = require('express');

const path = require("path");

//create instance of an Express app
const app = express();

const port = 8080;

//Serve react production build
app.use(express.static(path.join("C:/Users/Familia/Desktop/expressPortal", "dist")));

//Send react's index.html for routes that aren't api routes
app.get("/{*splat}", (req,res) => {
  res.sendFile(path.join("C:/Users/Familia/Desktop/expressPortal", "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Listening on URL https://localhost:${port}`);
});
