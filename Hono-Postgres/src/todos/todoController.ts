/** @notice library imports */
import type { Context } from "hono";
import { StatusCodes } from "http-status-codes";
// import type { BlankInput } from "hono/types";

/// Local imports
import { TodoServices } from "./TodoServices";
import { TodosRoutes } from "@/constants/routes";
import { ErrorResponse, SuccessResponse } from "@/types/responses";
import { Variables } from "./todoDependencyMiddleware";

export class TodoController {
  constructor(private todoService: TodoServices) {}

  async createTodo(c: Context<{ Variables: Variables }, TodosRoutes.CREATE>) {
    /// Parse body, invalid JSON is a client error
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid JSON body",
          code: "VALIDATION_ERROR",
        },
        StatusCodes.BAD_REQUEST,
      );
    }

    /// Validate fields
    const description = (body as { description?: unknown } | null)?.description;
    if (typeof description !== "string" || description.trim() === "") {
      return c.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid request body",
          details: "'description' must be a non-empty string",
          code: "VALIDATION_ERROR",
        },
        StatusCodes.BAD_REQUEST,
      );
    }

    /// Save into database
    const { id } = await this.todoService.create({ description });

    /// Response
    return c.json<SuccessResponse<{ id: number }>>(
      {
        success: true,
        data: { id },
      },
      StatusCodes.CREATED,
    );
  }
}
