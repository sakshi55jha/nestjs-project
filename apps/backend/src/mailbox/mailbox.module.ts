import { Module } from '@nestjs/common';
import { MailboxController } from './mailbox.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MailboxController],
  providers: [PrismaService],
})
export class MailboxModule {}
