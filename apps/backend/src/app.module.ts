import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/roles.guard';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './queues/queue.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderModule } from './reminder/reminder.module';
import { MailboxModule } from './mailbox/mailbox.module';




@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
       redis: {
    // Upstash uses a single TLS URL with a token for auth
    // @ts-ignore
    url: process.env.REDIS_URL,
    password: process.env.REDIS_TOKEN,
    tls: {}, // important for secure connection
  },
    }),
   
    // BullModule.registerQueue({
    //   name: 'registration',
    // }),
    AuthModule, CompetitionsModule, QueueModule, ReminderModule, MailboxModule,],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
