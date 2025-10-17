// src/mailbox/mailbox.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';

@Controller('api/mailbox')
@UseGuards(JwtAuthGuard)
export class MailboxController {
  constructor(private prisma: PrismaService) {}

  @Get('my')
  async getMyMails(@Req() req) {
    const userId = req.user.userId;
    return this.prisma.mailBox.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
    });
  }
}
