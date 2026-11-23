import {DEV_ONLY_JWT_SECRET, getJwtSecret, isProduction} from "./security-config";

const config = (v?: string) => ({get: () => v} as any);

describe("security-config", () => {
    it("fails fast in production without JWT_SECRET", () => {
        expect(() => getJwtSecret(config(), true)).toThrow("JWT_SECRET");
    });
    it("uses the configured secret", () => {
        expect(getJwtSecret(config("abc"), true)).toBe("abc");
    });
    it("falls back to the fake dev secret outside production", () => {
        expect(getJwtSecret(config(), false)).toBe(DEV_ONLY_JWT_SECRET);
    });
    it("detects production", () => {
        expect(isProduction({NODE_ENV: "production"})).toBe(true);
        expect(isProduction({NODE_ENV: "development"})).toBe(false);
    });
});
