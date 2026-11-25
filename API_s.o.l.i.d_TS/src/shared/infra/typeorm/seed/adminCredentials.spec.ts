import { resolveAdminCredentials } from "./adminCredentials";

describe("resolveAdminCredentials", () => {
    it("uses ADMIN_PASSWORD and ADMIN_EMAIL when given", () => {
        expect(
            resolveAdminCredentials({ ADMIN_PASSWORD: "s3cret-pw", ADMIN_EMAIL: "a@b.io" }),
        ).toEqual({ email: "a@b.io", password: "s3cret-pw", generated: false });
    });

    it("generates a random password outside production", () => {
        const a = resolveAdminCredentials({});
        const b = resolveAdminCredentials({});
        expect(a.generated).toBe(true);
        expect(a.password).toMatch(/^[0-9a-f]{32}$/);
        expect(a.password).not.toBe(b.password);
        expect(a.password).not.toBe("admin");
    });

    it("refuses to run in production without ADMIN_PASSWORD", () => {
        expect(() => resolveAdminCredentials({ NODE_ENV: "production" })).toThrow(/ADMIN_PASSWORD/);
    });
});
