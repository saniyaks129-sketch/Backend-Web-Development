const express = require("express");
const router = express.Router();
const auditWrite = require("../middleware/auditWrite"); // Provided middleware

// GET /posts - Public feed (NO audit log)
router.get("/", (req, res) => {
  res.json({ posts: [{ id: 1, title: "Hello World" }] });
});

// POST /posts - Per-route audit logged write
router.post("/", auditWrite, (req, res) => {
  res.status(201).json({ message: "Post created", data: req.body });
});

module.exports = router;