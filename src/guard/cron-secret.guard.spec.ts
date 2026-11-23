import {UnauthorizedException} from "@nestjs/common";
import {CronSecretGuard} from "./cron-secret.guard";

const ctx = (headers: Record<string, string>) =>
    ({switchToHttp: () => ({getRequest: () => ({headers})})} as any);
const config = (secret?: string) => ({get: () => secret} as any);

describe("CronSecretGuard", () => {
    it("rejects when CRON_SECRET is not configured", () => {
        expect(() => new CronSecretGuard(config()).canActivate(ctx({"x-cron-secret": "x"}))).toThrow(UnauthorizedException);
    });
    it("rejects a missing or wrong secret", () => {
        const guard = new CronSecretGuard(config("s3cret"));
        expect(() => guard.canActivate(ctx({}))).toThrow(UnauthorizedException);
        expect(() => guard.canActivate(ctx({"x-cron-secret": "nope"}))).toThrow(UnauthorizedException);
    });
    it("accepts the right secret via header or bearer", () => {
        const guard = new CronSecretGuard(config("s3cret"));
        expect(guard.canActivate(ctx({"x-cron-secret": "s3cret"}))).toBe(true);
        expect(guard.canActivate(ctx({authorization: "Bearer s3cret"}))).toBe(true);
    });
});
