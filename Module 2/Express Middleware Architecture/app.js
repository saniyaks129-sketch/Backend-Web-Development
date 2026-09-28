const express = require("express");
const requestId = require("./middleware/requestId");
const logger = require("./middleware/logger");
const timing = require("./middleware/timing");
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());

// 1. Global Observability Pipeline (requestId -> logger -> timing)
app.use(requestId);
app.use(logger);
app.use(timing);

// 2. Routers
app.use("/posts", postsRouter);
app.use("/users", usersRouter);

// 3. Conditional server start (prevents test port conflicts)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;