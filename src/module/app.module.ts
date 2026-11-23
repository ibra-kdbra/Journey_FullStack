import { Module } from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {getJwtSecret} from "../util/security-config";
import {UserModule} from "./user/user.module";
import { ProductModule } from "./product/product.module";
import {ClientModule} from "./client/client.module";
import {OrderModule} from "./order/order.module";
import {NotificationModule} from "./notification/notification.module";
import {ReportModule} from "./report/report.module";

@Module({
    imports:[
        /** load env config **/
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: getJwtSecret(configService),
                verifyOptions: {algorithms: ['HS256']},
                signOptions: {algorithm: 'HS256'},
            }),
        }),
        UserModule,
        ClientModule,
        OrderModule,
        ProductModule,
        ReportModule,
        NotificationModule,
    ]
})

export class AppModule {
}
