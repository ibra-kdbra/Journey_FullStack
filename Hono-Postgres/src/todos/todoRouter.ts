/** @notice library imports */
import { Hono } from "hono";
/// Local imports
import { TodosRoutes } from "@/constants/routes";
import { injectTodoDependenciesMiddleware } from "./todoDependencyMiddleware";

/// Todo router
export const todoRouter = new Hono({
  strict: false,
})
  /// Dependency injection
  .use("*", injectTodoDependenciesMiddleware)
  /// Create todo
  .post(TodosRoutes.CREATE, (c) => c.get("todoController").createTodo(c))

  /// Get todo by id
  .get(TodosRoutes.GET_BY_ID, async (c) => {
    const { id } = c.req.param();
    return c.text(`Got todo, ${id}`);
  })

  /// Get todos
  .get(TodosRoutes.GET_ALL, async (c) => {
    return c.text(`Got todos`);
  });
