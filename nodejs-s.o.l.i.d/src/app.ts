import express from "express";
import { authRoutes, userRoutes, MainRoutes } from "./routes";
import { errorHandler } from "./middlewares";

import "reflect-metadata";

const app = express();
app.use(express.json());
// public/ only holds fonts; generated exports are never written here.
app.use(express.static('public'));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/", MainRoutes);
app.use(errorHandler);

export default app;
