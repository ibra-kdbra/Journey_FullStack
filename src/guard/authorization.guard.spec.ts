import {Reflector} from "@nestjs/core";
import {UnauthorizedException} from "@nestjs/common";
import {AuthorizationGuard} from "./authorization.guard";
import {Public} from "../decorator/public.decorator";

const mockVerifyIdToken = jest.fn();
jest.mock("firebase-admin", () => ({__esModule: true, default: {app: jest.fn(() => ({}))}}));
jest.mock("firebase-admin/auth", () => ({getAuth: jest.fn(() => ({verifyIdToken: mockVerifyIdToken}))}));

class PublicController {
    @Public()
    open() {}
    closed() {}
}

const TOKEN = "aaa.bbb.ccc";
const makeContext = (handler: Function, headers: Record<string, string> = {}) => {
    const request: any = {headers};
    return {
        request,
        context: {
            getClass: () => PublicController,
            getHandler: () => handler,
            switchToHttp: () => ({getRequest: () => request}),
        } as any,
    };
};

describe("AuthorizationGuard", () => {
    const guard = new AuthorizationGuard(new Reflector());
    const controller = new PublicController();

    beforeEach(() => mockVerifyIdToken.mockReset());

    it("rejects requests without a token (401) without calling Firebase", async () => {
        const {context} = makeContext(controller.closed);
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it("rejects malformed tokens", async () => {
        const {context} = makeContext(controller.closed, {authorization: "Bearer not-a-jwt"});
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("rejects when Firebase verification fails (bad signature, expired, revoked)", async () => {
        mockVerifyIdToken.mockRejectedValue(new Error("auth/argument-error"));
        const {context} = makeContext(controller.closed, {authorization: `Bearer ${TOKEN}`});
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it("accepts a verified token, checks revocation and sets currentUser", async () => {
        mockVerifyIdToken.mockResolvedValue({uid: "u1", sub: "u1", role: "ADMIN"});
        const {context, request} = makeContext(controller.closed, {authorization: `Bearer ${TOKEN}`});
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(mockVerifyIdToken).toHaveBeenCalledWith(TOKEN, true);
        expect(request.currentUser.user_id).toBe("u1");
        expect(request.currentUser.role).toBe("ADMIN");
    });

    it("lets routes marked @Public() through without a token", async () => {
        const {context} = makeContext(controller.open);
        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });
});
