const express = require("express");
const requestId = require("./middleware/requestId");
const logger = require("./middleware/logger");
const timing = require("./middleware/timing");
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());

// Global Middleware Pipeline (Registration order: requestId -> logger -> timing)
app.use(requestId);
app.use(logger);
app.use(timing);

// Route Mounting
app.use("/posts", postsRouter);
app.use("/users", usersRouter);

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;