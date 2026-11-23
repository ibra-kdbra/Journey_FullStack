/** @notice library imports */
import { execSync } from "child_process";
import { testClient } from "hono/testing";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { todos } from "@/schemas";
import { todoRouter } from "./todoRouter";
import { ApplicationRoutes } from "@/constants/routes";
import { database, postgresClient } from "@/config/database";

/// Route - /todos
const app = testClient(todoRouter);

describe(ApplicationRoutes.TODOS, () => {
  /// Database connection
  beforeAll(async () => {
    execSync("NODE_ENV=test bun run db:migrate");
  });
  beforeEach(async () => {
    await database.delete(todos);
  });

  afterAll(async () => {
    await postgresClient.end();
  });

  /// Current test data
  const todoData = {
    description: "My first todo",
  };

  describe("[POST] /todos", () => {
    it("Should return status 201 after creation.", async () => {
      const response = await app.index.$post({
        json: todoData,
      });

      expect(response.status).toBe(StatusCodes.CREATED);
    });

    it("Should return json response.", async () => {
      const response = await app.index.$post({
        json: todoData,
      });

      expect(response.headers.get("content-type")).toStrictEqual(
        expect.stringContaining("json"),
      );
    });

    it("Should persist the user in the database.", async () => {
      await app.index.$post({
        json: todoData,
      });

      const todos = await database.query.todos.findMany();

      expect(todos).toHaveLength(1);
      expect(todos[0].isCompleted).toBeFalsy();
      expect(todos[0].description).toBe(todoData.description);
    });

    it("Should contain 'success' & 'data.id' in json response.", async () => {
      const response = await app.index.$post({
        json: todoData,
      });

      const json = await response.json();
      expect(json).toHaveProperty("success");
      expect(json.success).toBeTruthy();
      expect(json).toHaveProperty("data.id");
    });

    it("Should return 400 and ErrorResponse for missing or empty description.", async () => {
      for (const json of [
        {},
        { description: "" },
        { description: "   " },
        { description: 5 },
      ]) {
        const response = await app.index.$post({ json: json as never });
        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        const body = (await response.json()) as unknown as Record<
          string,
          unknown
        >;
        expect(body.success).toBe(false);
        expect(body.code).toBe("VALIDATION_ERROR");
      }
      expect(await database.query.todos.findMany()).toHaveLength(0);
    });

    it("Should return 400 for invalid JSON.", async () => {
      const response = await todoRouter.request("/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("onErrorHandler", () => {
    it("Should not leak the raw error message in a 500 body.", async () => {
      const { Hono } = await import("hono");
      const { onErrorHandler } = await import("@/middlewares/onErrorHandler");
      const failing = new Hono().onError(onErrorHandler).get("/", () => {
        throw new Error("secret internal detail");
      });
      const response = await failing.request("/");
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(await response.text()).not.toContain("secret internal detail");
    });
  });
});
