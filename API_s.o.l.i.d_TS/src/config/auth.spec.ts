import { getJwtSecret } from "./auth";

describe("getJwtSecret", () => {
    const original = process.env.JWT_SECRET;
    afterEach(() => {
        process.env.JWT_SECRET = original;
    });

    it("throws when JWT_SECRET is unset", () => {
        delete process.env.JWT_SECRET;
        expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
    });

    it("throws when JWT_SECRET is too short", () => {
        process.env.JWT_SECRET = "short";
        expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
    });

    it("returns the configured secret", () => {
        process.env.JWT_SECRET = "x".repeat(40);
        expect(getJwtSecret()).toBe("x".repeat(40));
    });
});
