import {ConfigService} from "@nestjs/config";

/** Clearly fake secret used only outside production so local dev works without setup. */
export const DEV_ONLY_JWT_SECRET = "dev-only-insecure-jwt-secret-do-not-use-in-production";

export function isProduction(env: Record<string, string | undefined> = process.env): boolean {
    return env.NODE_ENV === "production" || env.ENV === "production" || env.ENV === "prod";
}

/**
 * Returns the secret used to verify JWT signatures. In production a missing
 * JWT_SECRET is a startup error; elsewhere a fake dev-only secret is used.
 */
export function getJwtSecret(configService: ConfigService, production: boolean = isProduction()): string {
    const secret = configService.get<string>("JWT_SECRET");
    if (secret) {
        return secret;
    }
    if (production) {
        throw new Error("JWT_SECRET must be set in production");
    }
    return DEV_ONLY_JWT_SECRET;
}
