function timing(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const idPrefix = req.id ? `[${req.id.slice(0, 8)}] ` : "";
    console.log(`${idPrefix}${req.method} ${req.path} took ${duration}ms`);
  });
  next();
}

module.exports = timing;