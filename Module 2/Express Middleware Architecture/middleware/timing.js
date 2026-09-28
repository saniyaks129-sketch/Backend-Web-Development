function timing(req, res, next) {
  const start = Date.now();

  // Register callback on response completion
  res.on("finish", () => {
    const duration = Date.now() - start;
    const idPrefix = req.id ? `[${req.id.slice(0, 8)}] ` : "";
    console.log(`${idPrefix}${req.method} ${req.path} took ${duration}ms`);
  });

  // Continue immediately without blocking
  next();
}

module.exports = timing;