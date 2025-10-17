import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Processor('registration')
@Injectable()
export class RegistrationProcessor {
  private readonly logger = new Logger(RegistrationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('confirmation')
  async handleConfirmation(
    job: Job<{ registrationId: number; userId: number; competitionId: number }>
  ) {
    const { registrationId, userId, competitionId } = job.data;
    this.logger.log(`📦 [JOB RECEIVED] Job ID: ${job.id} | registrationId: ${registrationId} | userId: ${userId} | competitionId: ${competitionId}`);

    try {
      // Step 1: Verify registration
      const registration = await this.prisma.registration.findUnique({
        where: { id: registrationId },
        include: { user: true, competition: true },
      });
      if (!registration) throw new Error('Registration not found');
      this.logger.log(`✅ Registration found: ${JSON.stringify(registration)}`);

      // Step 2: Verify competition
      const competition = registration.competition;
      if (!competition) throw new Error('Competition not found');
      this.logger.log(`✅ Competition verified: ${competition.title}`);

      // Step 3: Simulate sending confirmation email (store in MailBox)
      await this.prisma.mailBox.create({
        data: {
          userId,
          to: registration.user.email,
          subject: `Registration Confirmed for ${competition.title}`,
          body: `Hi ${registration.user.name}, your registration (id:${registrationId}) is confirmed for ${competition.title}.`,
          sentAt: new Date(),
        },
      });
      this.logger.log(`📨 Confirmation mail queued for ${registration.user.email}`);

      this.logger.log(`🎉 [SUCCESS] Confirmation processed for registration ${registrationId}`);
    } catch (err: any) {
      this.logger.error(`❌ [ERROR] Job ${job.id} failed: ${err?.message ?? err}`);

      try {
        await this.prisma.failedJob.create({
          data: {
            queue: 'registration',
            jobId: job.id?.toString() ?? 'unknown',
            error: err?.message ?? String(err),
            createdAt: new Date(),
          },
        });
        this.logger.log(`🪶 Logged failed job into FailedJob table`);
      } catch (e) {
        this.logger.error(`💥 Failed to write failedJob row: ${e?.message ?? e}`);
      }

      throw err;
    }
  }
}
