import DEFAULT_AVATAR from "../clients/avatarClient.js";

/**
 * Helper function to create a delay/sleep in milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Set timeout per attempt using AbortController.
 */
export async function withTimeout(operation, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 2. Classify errors for retry eligibility.
 * Retries AbortError, network errors (no status), 429, and 5xx.
 * Does NOT retry 4xx errors (e.g., 400).
 */
export function isRetryable(error) {
  if (error.name === "AbortError") return true;
  if (!error.status) return true;
  if (error.status === 429 || error.status >= 500) return true;
  return false;
}

/**
 * Retry operation with exponential backoff and attempt limits.
 */
export async function withRetry(operation, options = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts - 1;

      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
}

/**
 * 3. Compose wrapper and degrade safely.
 * Order: fallback( retry( timeout( avatarClient.getAvatar ) ) )
 */
export async function getProfileWithAvatar(avatarClient, userId, options = {}) {
  const timeoutMs = options.timeoutMs ?? 2000;
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 100;

  try {
    const avatar = await withRetry(
      () => withTimeout((signal) => avatarClient.getAvatar(userId, { signal }), timeoutMs),
      { maxAttempts, baseDelayMs }
    );

    return {
      userId,
      avatar,
      degraded: false,
    };
  } catch (error) {
    return {
      userId,
      avatar: DEFAULT_AVATAR,
      degraded: true,
    };
  }
}