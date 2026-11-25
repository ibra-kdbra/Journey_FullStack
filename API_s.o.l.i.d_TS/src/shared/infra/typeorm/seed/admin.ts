import { hash } from "bcrypt";
import { randomUUID } from "node:crypto";

import { AppDataSource } from "../index";
import { resolveAdminCredentials } from "./adminCredentials";

async function create() {
    // Resolve (and possibly refuse) before touching the database.
    const credentials = resolveAdminCredentials();
    await AppDataSource.initialize();

    const id = randomUUID();
    const password = await hash(credentials.password, 10);

    // Parameterised. The previous version interpolated the values straight into
    // the SQL string.
    await AppDataSource.query(
        `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license)
         VALUES ($1, $2, $3, $4, true, now(), $5)`,
        [id, "admin", credentials.email, password, "XXX123456"],
    );
    await AppDataSource.destroy();
    console.log(`User admin created: ${credentials.email}`);
    if (credentials.generated) {
        console.log(
            `Generated password (shown once, set ADMIN_PASSWORD to choose your own): ${credentials.password}`,
        );
    }
}

create().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
