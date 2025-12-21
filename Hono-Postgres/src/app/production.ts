/** @notice library imports */
import { serve } from "@hono/node-server";
/// Local imports
import app from "./application";
import { Environments } from "@/config";

/// Running app
serve({
  fetch: app.fetch,
  port: Environments.PORT,
});
