// push-notification.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushNotification } from './notification.interfaces';

@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  sendPushNotification(@Body() notification: PushNotification): void {
    this.notificationService.sendPushNotification(notification);
  }
}
