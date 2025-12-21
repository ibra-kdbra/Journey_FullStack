/** @notice library imports */
import type { NotFoundHandler } from "hono";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { Logger } from "@/config";

export const onNotFoundHandler: NotFoundHandler = (c) => {
  Logger.error(`[NOT FOUND] ${c.req.path}`);

  return c.json(
    {
      success: false,
      message: `[NOT FOUND] ${c.req.path}`,
    },
    StatusCodes.NOT_FOUND,
  );
};
