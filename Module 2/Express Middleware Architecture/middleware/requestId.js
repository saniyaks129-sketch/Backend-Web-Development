const { randomUUID } = require("crypto");

function requestId(req, res, next) {
  // Generate unique ID and attach to req object
  req.id = randomUUID();

  // Set response header for client tracking
  res.setHeader("X-Request-Id", req.id);

  // Continue to next middleware
  next();
}

module.exports = requestId;