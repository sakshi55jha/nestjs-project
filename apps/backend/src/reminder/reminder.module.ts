import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { BullModule } from '@nestjs/bull';
import { ReminderProcessor } from './reminder.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';



@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'reminder', // Queue name for reminders
    }),
    PrismaModule,
  ],
  providers: [ReminderService, ReminderProcessor, PrismaService],
  exports: [ReminderService],
})
export class ReminderModule {}
