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
    execSync("NODE_ENV=test bun run db:push");
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
  });
});
