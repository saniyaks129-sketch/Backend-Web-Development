import express from 'express';
import { charges, idempotency, nextChargeId } from '../store.js';

const router = express.Router();

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // 1. Missing key -> Reject with 400 validation error
  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Header Idempotency-Key is required to process payments.',
      },
    });
  }

  // 2. Repeat key -> Return cached response (same status and body)
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);
    return res.status(saved.status).json(saved.body);
  }

  // 3. New key -> Perform charge, save response, return 201
  const { amount, currency } = req.body;
  const charge = {
    id: nextChargeId(),
    amount,
    currency: currency || 'INR',
    createdAt: new Date().toISOString(),
  };

  charges.push(charge);

  const responseStatus = 201;
  const responseBody = {
    message: 'Payment processed successfully',
    charge,
  };

  // Cache full response under the idempotency key
  idempotency.set(key, {
    status: responseStatus,
    body: responseBody,
  });

  return res.status(responseStatus).json(responseBody);
});

export default router;