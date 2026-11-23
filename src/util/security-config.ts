export function isProduction(env: Record<string, string | undefined> = process.env): boolean {
    return env.NODE_ENV === "production" || env.ENV === "production" || env.ENV === "prod";
}
