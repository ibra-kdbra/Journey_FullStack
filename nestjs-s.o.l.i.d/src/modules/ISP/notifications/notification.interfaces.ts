import { IsNotEmpty, IsString } from 'class-validator';

//Bad ❌
//Not seperating the concerns
export interface Notification {
  to?: string; //< for email
  subject?: string; //< for email
  body?: string; //< for email & push
  phoneNumber?: string; //< for sms
  message?: string; //< for sms
  userId?: string; //< for push
  title?: string; //< for push
}

//Good ✅
//Classes (not interfaces) so ValidationPipe can validate the request bodies
export class EmailNotification {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class SMSNotification {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class PushNotification {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
