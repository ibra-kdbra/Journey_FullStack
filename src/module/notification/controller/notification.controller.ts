import {Body, Controller, Get, NotFoundException, Post, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import { NotificationService } from "../service/notification.service";
import { SendMessageRequestDto } from "../dto/request/send-message.request.dto";
import {TwilioIncomingMessageRequestDto} from "../dto/request/twilio-incoming-message.request.dto";

import {Public} from "../../../decorator/public.decorator";
import {CronSecretGuard} from "../../../guard/cron-secret.guard";
import {TwilioSignatureGuard} from "../../../guard/twilio-signature.guard";
import {isProduction} from "../../../util/security-config";

@Controller("notifications")
@ApiTags("notifications")
export class NotificationController {

    constructor(private notificationService: NotificationService) {
    }

    // Requires a valid JWT (global guard) and is not served in production
    @Get("message/test")
    @ApiOperation({summary: "Test message"})
    public async sendMessage(@Query() dto: SendMessageRequestDto) {
        if (isProduction()) {
            throw new NotFoundException();
        }
        return await this.notificationService.sendMessage(dto);
    }

    // Called by the scheduler: authenticated with the CRON_SECRET shared secret
    @Public()
    @UseGuards(CronSecretGuard)
    @Post("cronjob/send-message")
    @ApiOperation({summary: "process scheduled notification message"})
    public async processScheduledNotifications() {
        console.log(`processScheduledNotifications`)
        return await this.notificationService.processScheduledNotifications();
    }

    // Called by Twilio: authenticated by verifying the X-Twilio-Signature header
    @Public()
    @UseGuards(TwilioSignatureGuard)
    @Post("/incoming-message")
    @ApiOperation({summary: "process incoming Twilio message"})
    public async processIncomingMessage(@Body() dto: TwilioIncomingMessageRequestDto) {
        return await this.notificationService.processIncomingMessage(dto);
    }
}