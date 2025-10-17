import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';


@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('reminder') private reminderQueue: Queue,
  ) {}

  // Runs every minute in dev (will change to EVERY_DAY_AT_MIDNIGHT in prod)
  @Cron(CronExpression.EVERY_MINUTE)
  async sendReminders() {
    this.logger.log('🔁 Checking for upcoming competitions...');

    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find competitions whose registration deadline is within next 24h
    const competitions = await this.prisma.competition.findMany({
      where: {
        regDeadline: {
          gte: now,
          lte: next24h,
        },
      },
      select: {
    id: true,
    title: true, 
    regDeadline: true,
    registrations: {
      include: {
        user: true,
      },
    },
  },
});
   

    if (!competitions.length) {
      this.logger.log('No upcoming competitions in next 24 hours.');
      return;
    }

    // Enqueue a reminder job for each user registered
    for (const competition of competitions) {
      for (const reg of competition.registrations) {
        await this.reminderQueue.add('notify', {
          userId: reg.userId,
          competitionId: competition.id,
          competitionName: competition.title,
        });
      }
    }

    this.logger.log(`📩 Enqueued reminders for ${competitions.length} competitions.`);
  }
}
