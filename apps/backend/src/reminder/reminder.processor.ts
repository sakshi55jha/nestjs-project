import { Process, Processor} from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Processor('reminder')
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('notify')
  async handleNotify(job: Job<{ userId: number; competitionId: number; competitionName: string }>) {
    try {
      const { userId, competitionId, competitionName } = job.data;

     const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        this.logger.warn(`⚠️ User with ID ${userId} not found`);
        return;
      }

      await this.prisma.mailBox.create({
        data: {
          userId,
          to: user.email,
          subject: `Reminder: ${competitionName} Remainder`,
          body: `Hi ${user.email}, ${competitionName} Starting in 24hrs! Get Ready!!`,
          sentAt: new Date(),
        },
      });


      this.logger.log(`✅ Reminder sent to user ${userId} for competition ${competitionName}`);
    } catch (e) {
      this.logger.error(`❌ Failed to send reminder: ${e.message}`);
    }
  }
}