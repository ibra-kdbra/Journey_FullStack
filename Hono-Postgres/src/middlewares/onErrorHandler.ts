/** @notice library imports */
import type { ErrorHandler } from "hono";
import { StatusCodes } from "http-status-codes";
import { HTTPException } from "hono/http-exception";
/// Local imports
import { Logger } from "@/config";
import type { ErrorResponse } from "@/types/responses";

export const onErrorHandler: ErrorHandler = (error, c) => {
  Logger.error(error.message);

  if (error instanceof HTTPException) {
    return c.json({}, error.status);
  }

  return c.json(
    {
      success: false,
      error: "Internal server error",
      code: "SERVER_ERROR",
    } satisfies ErrorResponse,
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};
