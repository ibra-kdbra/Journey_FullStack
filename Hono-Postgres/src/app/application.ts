/** @notice library imports */
import { Hono } from "hono";

/// Local imports
import { handlers } from "@/middlewares";
import { todoRouter } from "@/todos/todoRouter";
import { ApplicationRoutes } from "@/constants/routes";

/// Core app
const app = new Hono({ strict: false });

/// Routers
app.route(ApplicationRoutes.TODOS, todoRouter);

/// Global handlers
app.onError(handlers.onErrorHandler);
app.notFound(handlers.onNotFoundHandler);

export default app;
