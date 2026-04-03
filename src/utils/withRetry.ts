import { RequestError } from "./requestClient.js";

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 2000;

  let lastError: RequestError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof RequestError &&
        error.retryable &&
        attempt < maxRetries
      ) {
        lastError = error;
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.error(
          `[RETRY] Attempt ${attempt + 1}/${maxRetries} failed (${error.code}): ${error.message}. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
