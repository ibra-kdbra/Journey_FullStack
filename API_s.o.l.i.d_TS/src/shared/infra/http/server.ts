import { AppDataSource } from "../typeorm";
import { app } from "./app";

/**
 * The DataSource is initialised before the server accepts traffic. It used to
 * be a bare `createConnection()` in app.ts with no await, so the first requests
 * after boot raced the connection and failed against a repository that had no
 * driver yet.
 */
AppDataSource.initialize()
    .then(() => {
        app.listen(3333, () => console.log("Server is Running on port 3333!"));
    })
    .catch((error) => {
        console.error("Could not connect to the database:", error);
        process.exit(1);
    });
