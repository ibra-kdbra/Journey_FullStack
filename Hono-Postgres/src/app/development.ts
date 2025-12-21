/** @notice library imports */
/// Local imports
import app from "./application";
import { Environments } from "@/config";

/// Running app
export default {
  fetch: app.fetch,
  port: Environments.PORT,
};
