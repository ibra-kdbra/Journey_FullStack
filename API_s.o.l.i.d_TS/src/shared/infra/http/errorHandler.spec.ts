import { Request, Response } from "express";

import { AppError } from "../../errors/AppError";
import { errorHandler } from "./errorHandler";

function fakeRes() {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe("errorHandler", () => {
    it("returns an AppError's own status and message", () => {
        const res = fakeRes();
        errorHandler(
            new AppError("nope", 403),
            {} as Request,
            res as unknown as Response,
            jest.fn(),
        );
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "nope" });
    });

    it("does not leak the message of an unexpected error and logs it", () => {
        const res = fakeRes();
        const log = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const err = new Error('relation "users" does not exist');
        errorHandler(err, {} as Request, res as unknown as Response, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(JSON.stringify(res.json.mock.calls)).not.toContain("relation");
        expect(log).toHaveBeenCalledWith(err);
        log.mockRestore();
    });

    it("AppError is a real Error", () => {
        const err = new AppError("x");
        expect(err).toBeInstanceOf(Error);
        expect(err.stack).toBeDefined();
        expect(err.statusCode).toBe(400);
    });
});
