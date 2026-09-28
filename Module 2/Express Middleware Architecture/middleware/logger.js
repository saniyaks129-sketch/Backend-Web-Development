function logger(req, res, next) {
  res.on("finish", () => {
    const idPrefix = req.id ? `[${req.id.slice(0, 8)}] ` : "";
    console.log(`${idPrefix}${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
}

module.exports = logger;