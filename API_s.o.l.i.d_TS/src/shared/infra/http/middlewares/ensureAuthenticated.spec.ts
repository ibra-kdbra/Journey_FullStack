import "reflect-metadata";
import { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { container } from "tsyringe";

import { UserRepositoryInMemory } from "../../../../modules/accounts/repositories/in-memory/UserRepositoryInMemory";
import { AppError } from "../../../errors/AppError";
import { ensureAuthenticated } from "./ensureAuthenticated";

const SECRET = process.env.JWT_SECRET as string;

let users: UserRepositoryInMemory;

function requestWith(authorization?: string) {
    return { headers: { authorization } } as unknown as Request;
}

describe("ensureAuthenticated", () => {
    beforeEach(() => {
        users = new UserRepositoryInMemory();
        container.registerInstance("UserRepository", users);
    });

    it("rejects a missing token with 401", async () => {
        await expect(
            ensureAuthenticated(requestWith(), {} as Response, jest.fn()),
        ).rejects.toMatchObject({ statusCode: 401, message: "Token missing" });
    });

    it("rejects an invalid token with 401", async () => {
        await expect(
            ensureAuthenticated(requestWith("Bearer nope"), {} as Response, jest.fn()),
        ).rejects.toBeInstanceOf(AppError);
    });

    it("rejects a valid token whose user no longer exists with 401", async () => {
        const token = sign({}, SECRET, { subject: "deleted-user-id" });
        await expect(
            ensureAuthenticated(requestWith(`Bearer ${token}`), {} as Response, jest.fn()),
        ).rejects.toMatchObject({ statusCode: 401, message: "User does not exists" });
    });

    it("calls next and sets req.user for an existing user", async () => {
        await users.create({
            name: "A",
            password: "x",
            email: "a@test.com",
            driver_license: "1",
        });
        const [user] = users.users;
        user.id = "existing-id";
        const token = sign({}, SECRET, { subject: user.id });
        const req = requestWith(`Bearer ${token}`);
        const next = jest.fn() as NextFunction;

        await ensureAuthenticated(req, {} as Response, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual({ id: "existing-id" });
    });
});
