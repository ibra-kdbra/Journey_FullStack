import request from "supertest";

import { app } from "../../../../shared/infra/http/app";
import { AppDataSource } from "../../../../shared/infra/typeorm";

/**
 * The one integration test in this project: it goes through express, the
 * tsyringe container and CategoryRepository to a real Postgres.
 *
 * It used to live next to CreateCategoryController, assert 201 from
 * `GET /cars/available` - a route that returns 200 - and never initialise a
 * connection, so it could only ever fail. Since app.ts no longer opens the
 * connection as an import side effect, the lifecycle is explicit here.
 */
describe("list categories (integration)", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
        await AppDataSource.runMigrations();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it("returns the categories table as an array", async () => {
        const response = await request(app).get("/categories").expect(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("serves available cars", async () => {
        const response = await request(app).get("/cars/available").expect(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
