import { randomBytes } from "node:crypto";

export interface IAdminCredentials {
    email: string;
    password: string;
    generated: boolean;
}

// The seeded admin's password comes from ADMIN_PASSWORD. Without it a random
// one is generated (and printed once by the seed) everywhere except production,
// where running without an explicit password is refused.
export function resolveIAdminCredentials(env: NodeJS.ProcessEnv = process.env): IAdminCredentials {
    const email = env.ADMIN_EMAIL || "admin@ufc.br";
    if (env.ADMIN_PASSWORD) {
        return { email, password: env.ADMIN_PASSWORD, generated: false };
    }
    if (env.NODE_ENV === "production") {
        throw new Error("ADMIN_PASSWORD must be set to seed the admin user in production");
    }
    return { email, password: randomBytes(16).toString("hex"), generated: true };
}
