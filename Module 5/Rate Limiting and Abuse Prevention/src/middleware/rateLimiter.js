import rateLimit from 'express-rate-limit';

/**
 * Multi-instance / Scale Explanation (Redis-backed Store):
 * 
 * The default MemoryStore keeps request counters in the Node process's local memory.
 * In a production setup running multiple instances behind a load balancer, each instance
 * maintains its own separate counter. An attacker could bypass limits by spreading requests
 * across instances (e.g., 5 attempts per instance * 3 instances = 15 total allowed attempts).
 * 
 * In production, replace MemoryStore with a Redis-backed store (using `rate-limit-redis`).
 * A RedisStore centralizes the rate limit counters into a shared Redis database that all
 * application instances talk to, ensuring the true rate limit (5 attempts max total) is
 * strictly enforced across the entire cluster regardless of horizontal scaling.
 */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 failed attempts per window
  skipSuccessfulRequests: true, // Only count failed login/auth attempts
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    // Calculate seconds remaining for Retry-After header
    const resetTime = req.rateLimit.resetTime;
    const retryAfterSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);

    res.setHeader('Retry-After', retryAfterSeconds > 0 ? retryAfterSeconds : 900);
    return res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many failed authentication attempts. Please try again later.',
      },
    });
  },
});

export default authLimiter;