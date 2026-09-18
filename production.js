
const createApp = require('./index.js');
const authenticate = require('./middleware/authenticate.js');

const PORT = 5000;

const app = createApp(authenticate);

// Only start this server when this file is run directly.
if (require.main === module) {
  app.listen(PORT, () => console.log("Server is running at port " + PORT));
}

module.exports = app;
