function logger(req, res, next) {
  // Register callback on response completion
  res.on("finish", () => {
    const idPrefix = req.id ? `[${req.id.slice(0, 8)}] ` : "";
    console.log(`${idPrefix}${req.method} ${req.path} ${res.statusCode}`);
  });

  // Continue immediately without blocking
  next();
}

module.exports = logger;