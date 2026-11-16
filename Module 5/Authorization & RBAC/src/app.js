import express from 'express';
import { requireAuth } from './middleware/requireAuth.js';
import { requireRole } from './middleware/requireRole.js';
import postsRouter from './routes/posts.js';

const app = express();
app.use(express.json());

// Gate admin-only route with requireRole('admin')
app.delete('/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: `User ${req.params.id} deleted` });
});

app.use('/posts', postsRouter);

export default app;