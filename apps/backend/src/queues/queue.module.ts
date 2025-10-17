import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegistrationProcessor } from './registration.processor';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'registration', // Queue name
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [RegistrationProcessor, PrismaService],
  exports: [BullModule],
})
export class QueueModule {}
