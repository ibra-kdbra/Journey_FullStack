import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {validateRequest} from "twilio";
import {TwilioKeysResponseDto} from "../module/notification/dto/response/twilio-keys.response.dto";

/**
 * Verifies the X-Twilio-Signature header on Twilio webhooks using the account
 * auth token from TWILIO_KEY. The public URL Twilio calls should be set in
 * TWILIO_WEBHOOK_URL; otherwise it is rebuilt from the request (honouring
 * x-forwarded-* headers set by a trusted proxy).
 */
@Injectable()
export class TwilioSignatureGuard implements CanActivate {

    constructor(private readonly configService: ConfigService) {
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const signature = request?.headers?.["x-twilio-signature"];
        if (!signature || typeof signature !== "string") {
            throw new ForbiddenException("Missing Twilio signature");
        }

        let authToken: string | undefined;
        try {
            authToken = (JSON.parse(this.configService.get<string>("TWILIO_KEY")) as TwilioKeysResponseDto).twilio_auth_token;
        } catch (e) {
            authToken = undefined;
        }
        if (!authToken) {
            throw new ForbiddenException("Twilio signature validation is not configured");
        }

        const url = this.configService.get<string>("TWILIO_WEBHOOK_URL") || this.buildUrl(request);
        let valid = false;
        try {
            valid = validateRequest(authToken, signature, url, request.body || {});
        } catch (e) {
            valid = false;
        }
        if (!valid) {
            throw new ForbiddenException("Invalid Twilio signature");
        }
        return true;
    }

    private buildUrl(request: any): string {
        const proto = (request.headers?.["x-forwarded-proto"] as string)?.split(",")[0] || request.protocol;
        const host = (request.headers?.["x-forwarded-host"] as string)?.split(",")[0] || request.headers?.host;
        return `${proto}://${host}${request.originalUrl}`;
    }
}
