import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {UnauthorizedException} from "@nestjs/common";
import {AuthorizationGuard} from "./authorization.guard";
import {Public} from "../decorator/public.decorator";

class PublicController {
    @Public()
    open() {}
    closed() {}
}

const SECRET = "test-secret";
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
    const jwtService = new JwtService({secret: SECRET, verifyOptions: {algorithms: ["HS256"]}});
    const guard = new AuthorizationGuard(new Reflector(), jwtService);
    const controller = new PublicController();

    it("rejects requests without a token (401)", () => {
        const {context} = makeContext(controller.closed);
        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("rejects malformed tokens", () => {
        const {context} = makeContext(controller.closed, {authorization: "Bearer not-a-jwt"});
        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("rejects a token signed with the wrong key", () => {
        const forged = new JwtService({secret: "attacker-key"}).sign({sub: "u1", role: "ADMIN"});
        const {context} = makeContext(controller.closed, {authorization: `Bearer ${forged}`});
        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("rejects unsigned (alg none) tokens", () => {
        const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
        const token = `${b64({alg: "none", typ: "JWT"})}.${b64({sub: "u1"})}.sig`;
        const {context} = makeContext(controller.closed, {authorization: `Bearer ${token}`});
        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("rejects expired tokens", () => {
        const expired = jwtService.sign({sub: "u1"}, {expiresIn: -10});
        const {context} = makeContext(controller.closed, {authorization: `Bearer ${expired}`});
        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("accepts a correctly signed token and sets currentUser", () => {
        const token = jwtService.sign({sub: "u1", role: "ADMIN"});
        const {context, request} = makeContext(controller.closed, {authorization: `Bearer ${token}`});
        expect(guard.canActivate(context)).toBe(true);
        expect(request.currentUser.sub).toBe("u1");
    });

    it("lets routes marked @Public() through without a token", () => {
        const {context} = makeContext(controller.open);
        expect(guard.canActivate(context)).toBe(true);
    });
});
