import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegistrationProcessor } from './registration.processor';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'registration',
      redis: process.env.NODE_ENV === 'production'
        ? {
          //@ts-ignore
            url: process.env.REDIS_URL,
            password: process.env.REDIS_TOKEN,
            tls: {},
          }
        : { host: 'localhost', port: 6379 },
    }),
  ],
  providers: [RegistrationProcessor, PrismaService],
  exports: [BullModule],
})
export class QueueModule {}
