import "reflect-metadata";
import { Request, Response } from "express";

import { AppError } from "../../../errors/AppError";
import { ensureAdmin } from "./ensureAdmin";

const findById = jest.fn();
jest.mock("../../../../modules/accounts/infra/typeorm/repositories/UserRepository", () => ({
    UserRepository: jest.fn().mockImplementation(() => ({ findById })),
}));

const req = { user: { id: "u1" } } as unknown as Request;

describe("ensureAdmin", () => {
    it("rejects a non-admin with 403", async () => {
        findById.mockResolvedValue({ id: "u1", isAdmin: false });
        const next = jest.fn();
        await expect(ensureAdmin(req, {} as Response, next)).rejects.toMatchObject({
            statusCode: 403,
        });
        await expect(ensureAdmin(req, {} as Response, next)).rejects.toBeInstanceOf(AppError);
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next for an admin", async () => {
        findById.mockResolvedValue({ id: "u1", isAdmin: true });
        const next = jest.fn();
        await ensureAdmin(req, {} as Response, next);
        expect(next).toHaveBeenCalled();
    });
});
