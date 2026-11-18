// The client's cancellation of the tool call being served, for the api requests it makes.
import { AsyncLocalStorage } from "node:async_hooks";

const current = new AsyncLocalStorage<AbortSignal>();

export function runWithRequestSignal<T>(signal: AbortSignal, fn: () => T): T {
  return current.run(signal, fn);
}

/** Ends at the timeout, or as soon as the client cancels the call. */
export function requestSignal(timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  const cancelled = current.getStore();
  return cancelled ? AbortSignal.any([timeout, cancelled]) : timeout;
}

export const requestCancelled = (): boolean => current.getStore()?.aborted ?? false;
