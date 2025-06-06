import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TimerModule } from './timer/timer.module';
import { SessionModule } from './session/session.module';
import { BlocklistModule } from './blocklist/blocklist.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        return {
          type: 'postgres',
          url: configService.get('DATABASE_URL'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: !isProduction,
          logging: !isProduction,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    TimerModule,
    SessionModule,
    BlocklistModule,
    AnalyticsModule,
    NotificationModule,
  ],
})
export class AppModule {} 