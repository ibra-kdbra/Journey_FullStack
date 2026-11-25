import "reflect-metadata";
import express from "express";
import swaggerUi from "swagger-ui-express";

import "../../container";
import swaggerFile from "../../../swagger.json";
import { errorHandler } from "./errorHandler";
import { router } from "./routes";

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(router);

app.use(errorHandler);

export { app };
