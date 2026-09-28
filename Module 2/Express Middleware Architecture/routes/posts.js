const express = require("express");
const router = express.Router();
const auditWrite = require("../middleware/auditWrite");

// GET /posts (Public feed)
router.get("/", (req, res) => {
  res.json({ posts: [{ id: 1, title: "Hello World" }] });
});

// POST /posts (Per-route audit log mounted on POST only)
router.post("/", auditWrite, (req, res) => {
  res.status(201).json({ message: "Post created", data: req.body });
});

module.exports = router;