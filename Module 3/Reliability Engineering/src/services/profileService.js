/**
 * Helper function to wait/sleep for a few milliseconds before retrying.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. TIMEOUT WRAPPER
 * Stops waiting if the network call takes longer than `timeoutMs`.
 */
export async function withTimeout(operation, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer); // Clean up the timer when done
  }
}

/**
 * 2. RETRY WRAPPER
 * Tries the call up to `maxAttempts` times with exponential backoff.
 */
export async function withRetry(operation, maxAttempts = 3, baseDelayMs = 100) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      // If we used up all attempts, throw the final error
      if (attempt === maxAttempts - 1) {
        throw err;
      }

      // Don't retry client errors (like 400 or 404), only retry network/server blips
      if (err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err;
      }

      // Exponential backoff: 100ms, then 200ms, then 400ms...
      const delay = baseDelayMs * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
}

/**
 * 3. RELIABILITY WRAPPER (COMBINES TIMEOUT + RETRY + FALLBACK)
 * Tries to fetch the avatar safely. If it fails, returns the fallback avatar.
 */
export async function getReliableAvatar(
  fetchAvatarFn,
  userId,
  fallbackAvatar = '/assets/default-avatar.png',
  options = {}
) {
  const { timeoutMs = 2000, maxAttempts = 3 } = options;

  try {
    // Put Timeout INSIDE Retry
    return await withRetry(
      () => withTimeout((signal) => fetchAvatarFn(userId, { signal }), timeoutMs),
      maxAttempts
    );
  } catch (err) {
    // Return fallback picture if all retries fail
    return fallbackAvatar;
  }
}

/**
 * 4. PROFILE SERVICE HANDLER
 * Fetches profile data and attaches the reliable avatar.
 */
export async function getProfileWithAvatar(userId, fetchProfileFn, fetchAvatarFn) {
  const profile = await fetchProfileFn(userId);
  const avatar = await getReliableAvatar(fetchAvatarFn, userId);

  return {
    ...profile,
    avatar,
  };
}