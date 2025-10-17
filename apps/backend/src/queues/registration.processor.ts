// src/registration/registration.processor.ts
import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Processor('registration')
@Injectable()
export class RegistrationProcessor {
  private readonly logger = new Logger(RegistrationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  // process 'confirmation' jobs
  @Process('confirmation')
  async handleConfirmation(job: Job<{ registrationId: number; userId: number; competitionId: number }>) {
    const { registrationId, userId, competitionId } = job.data;
    this.logger.log(`Processing job ${job.id} for registration ${registrationId}`);

    try {
      // verify registration exists
      const registration = await this.prisma.registration.findUnique({
        where: { id: registrationId },
        include: { user: true, competition: true },
      });
      if (!registration) throw new Error('Registration not found');

      //verify competition still valid (deadline, capacity etc)
      const competition = registration.competition;
      if (!competition) throw new Error('Competition not found');

      // simulate sending confirmation — create MailBox row
      await this.prisma.mailBox.create({
        data: {
          userId,
          to: registration.user.email,
          subject: `Registration Confirmed for ${competition.title}`,
          body: `Hi ${registration.user.name}, your registration (id:${registrationId}) is confirmed for ${competition.title}.`,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Confirmation saved for registration ${registrationId}`);
    } catch (err: any) {
      // write into FailedJob table for DLQ auditing
      try {
        await this.prisma.failedJob.create({
          data: {
            queue: 'registration',
            jobId: job.id?.toString() ?? 'unknown',
            error: err?.message ?? String(err),
            createdAt: new Date(),
          },
        });
      } catch (e) {
          this.logger.error(`Failed to write failedJob row: ${e?.message ?? e}`);
      }

      this.logger.error(`Job ${job.id} failed: ${err?.message ?? err}`);
      throw err;
    }
  }
}
