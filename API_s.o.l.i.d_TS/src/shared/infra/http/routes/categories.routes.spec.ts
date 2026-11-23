import "reflect-metadata";
import { existsSync, readdirSync } from "fs";
import { sign } from "jsonwebtoken";
import request from "supertest";
import { container } from "tsyringe";

import { UserRepositoryInMemory } from "../../../../modules/accounts/repositories/in-memory/UserRepositoryInMemory";
import { app } from "../app";

const csv = Buffer.from("name,description\nSUV,Sport utility\n");

function tmpFiles(): string[] {
    return existsSync("./tmp") ? readdirSync("./tmp") : [];
}

describe("POST /categories/import", () => {
    beforeEach(() => {
        container.registerInstance("UserRepository", new UserRepositoryInMemory());
    });

    it("returns 401 and stores nothing for an anonymous upload", async () => {
        const before = tmpFiles();
        const res = await request(app)
            .post("/categories/import")
            .attach("file", csv, { filename: "c.csv", contentType: "text/csv" });
        expect(res.status).toBe(401);
        expect(tmpFiles()).toEqual(before);
    });

    it("returns 401 and stores nothing for a token signed with another secret", async () => {
        const before = tmpFiles();
        const token = sign({}, "some-other-secret-that-is-long-enough-123", { subject: "x" });
        const res = await request(app)
            .post("/categories/import")
            .set("Authorization", `Bearer ${token}`)
            .attach("file", csv, { filename: "c.csv", contentType: "text/csv" });
        expect(res.status).toBe(401);
        expect(tmpFiles()).toEqual(before);
    });
});
