import express from 'express';
import postsRouter from './routes/postsRouter.js'; // Adjust import name/path if needed

const app = express();

app.use(express.json());

// Routes
app.use('/', postsRouter);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  // Log full error diagnostics to server logs only
  console.error('[SERVER INTERNAL ERROR]:', err);

  // Return safe error response to client (zero stack trace leakage)
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our end',
    },
  });
});

export default app;