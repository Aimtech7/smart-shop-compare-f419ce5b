// Simulation utilities for realistic mock behavior

/** Simulate network delay (200-600ms by default) */
export const delay = (ms?: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms ?? 200 + Math.random() * 400));

/** Randomly fail with given probability (0-1). Default 5% */
export const maybeThrow = (probability = 0.05, message = 'Simulated network error'): void => {
  if (Math.random() < probability) {
    throw new Error(message);
  }
};

/** Wrap an async function with delay + optional random failures */
export function withSimulation<T>(
  fn: () => T | Promise<T>,
  options?: { delayMs?: number; failRate?: number; failMessage?: string }
): Promise<T> {
  return delay(options?.delayMs).then(() => {
    maybeThrow(options?.failRate ?? 0, options?.failMessage);
    return fn();
  });
}
