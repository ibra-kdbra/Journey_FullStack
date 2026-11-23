import {ForbiddenException} from "@nestjs/common";
import {getExpectedTwilioSignature} from "twilio/lib/webhooks/webhooks";
import {TwilioSignatureGuard} from "./twilio-signature.guard";

const TOKEN = "twilio-test-token";
const URL = "https://example.test/notifications/incoming-message";
const BODY = {From: "whatsapp:+15550001111", Body: "stock", WaId: "15550001111"};

const config = new Map<string, string>([
    ["TWILIO_KEY", JSON.stringify({twilio_account_sid: "AC1", twilio_auth_token: TOKEN, twilio_phone_number: "+1"})],
    ["TWILIO_WEBHOOK_URL", URL],
]);
const guard = new TwilioSignatureGuard({get: (k: string) => config.get(k)} as any);
const ctx = (headers: Record<string, string>, body: any) =>
    ({switchToHttp: () => ({getRequest: () => ({headers, body})})} as any);

describe("TwilioSignatureGuard", () => {
    it("rejects requests without a signature (403)", () => {
        expect(() => guard.canActivate(ctx({}, BODY))).toThrow(ForbiddenException);
    });
    it("rejects a forged signature", () => {
        expect(() => guard.canActivate(ctx({"x-twilio-signature": "forged"}, BODY))).toThrow(ForbiddenException);
    });
    it("rejects a signature computed for a different body", () => {
        const sig = getExpectedTwilioSignature(TOKEN, URL, {...BODY, Body: "other"});
        expect(() => guard.canActivate(ctx({"x-twilio-signature": sig}, BODY))).toThrow(ForbiddenException);
    });
    it("accepts a valid signature", () => {
        const sig = getExpectedTwilioSignature(TOKEN, URL, BODY);
        expect(guard.canActivate(ctx({"x-twilio-signature": sig}, BODY))).toBe(true);
    });
});
