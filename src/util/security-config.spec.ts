import {isProduction} from "./security-config";

describe("security-config", () => {
    it("detects production", () => {
        expect(isProduction({NODE_ENV: "production"})).toBe(true);
        expect(isProduction({ENV: "prod"})).toBe(true);
        expect(isProduction({NODE_ENV: "development"})).toBe(false);
    });
});
