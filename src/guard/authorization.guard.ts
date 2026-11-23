import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import admin from "firebase-admin";
import {getAuth} from "firebase-admin/auth";
import {PermissionModel} from "../model/permission.model";
import {JwtModel} from "../model/jwt.model";
import {isJWT} from "class-validator";

export const FIREBASE_APP_NAME = "firebase";

@Injectable()
export class AuthorizationGuard implements CanActivate {

    constructor(private readonly reflector: Reflector) {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublicController = this.reflector.get<boolean>('isPublic', context.getClass());
        const isPublicMethod = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (isPublicController || isPublicMethod) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authorization: string | undefined = request?.headers?.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing bearer token");
        }

        const jwt = authorization.substring("Bearer ".length).trim();
        if (!isJWT(jwt)) {
            throw new UnauthorizedException("Malformed bearer token");
        }

        try {
            // Verifies signature, issuer/audience, expiry and revocation with Firebase.
            // Reuses the 'firebase' app initialised by UserService.
            const decoded = await getAuth(admin.app(FIREBASE_APP_NAME)).verifyIdToken(jwt, true);
            request.currentUser = <JwtModel><unknown>{...decoded, user_id: decoded.uid};
        } catch (e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        return true;
    }

    parsePermissions(permissions: string[]): Array<PermissionModel> {
        if (!permissions) {
            return [];
        } else {
            const parsed = new Array<PermissionModel>();
            Object.keys(permissions).forEach((key) => {
                const p = key.toLowerCase().split("_");
                parsed.push({
                    action: p[0],
                    possession: p[1],
                    resource: p[2],
                    attributes: permissions[key]
                })
            });
            return parsed;
        }
    }

}
