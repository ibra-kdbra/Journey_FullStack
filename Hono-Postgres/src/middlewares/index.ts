/** @notice local imports */
import { onErrorHandler } from "./onErrorHandler";
import { onNotFoundHandler } from "./onNotFoundHandler";

/// Export all the handlers
export const handlers = Object.freeze({
  onErrorHandler,
  onNotFoundHandler,
});
