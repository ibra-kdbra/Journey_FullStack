// sms.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SMSNotification } from './notification.interfaces';

@Controller('sms')
export class SMSController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  sendSMS(@Body() notification: SMSNotification): void {
    this.notificationService.sendSMS(notification);
  }
}
