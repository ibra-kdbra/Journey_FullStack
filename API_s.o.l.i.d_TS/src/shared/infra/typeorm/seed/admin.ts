import { hash } from "bcrypt";
import { randomUUID } from "node:crypto";

import { AppDataSource } from "../index";

async function create() {
    await AppDataSource.initialize();

    const id = randomUUID();
    const password = await hash("admin", 10);

    // Parameterised. The previous version interpolated the values straight into
    // the SQL string.
    await AppDataSource.query(
        `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license)
         VALUES ($1, $2, $3, $4, true, now(), $5)`,
        [id, "admin", "admin@ufc.br", password, "XXX123456"],
    );
    await AppDataSource.destroy();
}

create().then(() => console.log("User admin created"));
