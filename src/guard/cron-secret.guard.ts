import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {timingSafeEqual} from "crypto";

/**
 * Protects scheduler-triggered endpoints with a shared secret (CRON_SECRET),
 * sent as `x-cron-secret` or `Authorization: Bearer <secret>`.
 * If CRON_SECRET is not configured every request is rejected.
 */
@Injectable()
export class CronSecretGuard implements CanActivate {

    constructor(private readonly configService: ConfigService) {
    }

    canActivate(context: ExecutionContext): boolean {
        const expected = this.configService.get<string>("CRON_SECRET");
        if (!expected) {
            throw new UnauthorizedException("Cron endpoint is not enabled");
        }

        const request = context.switchToHttp().getRequest();
        let provided: string | undefined = request?.headers?.["x-cron-secret"];
        const authorization: string | undefined = request?.headers?.authorization;
        if (!provided && authorization?.startsWith("Bearer ")) {
            provided = authorization.substring("Bearer ".length).trim();
        }
        if (!provided || !CronSecretGuard.safeEqual(provided, expected)) {
            throw new UnauthorizedException("Invalid cron secret");
        }
        return true;
    }

    private static safeEqual(a: string, b: string): boolean {
        const ab = Buffer.from(a);
        const bb = Buffer.from(b);
        return ab.length === bb.length && timingSafeEqual(ab, bb);
    }
}
