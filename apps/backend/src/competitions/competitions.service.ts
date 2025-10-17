import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('registration') private registrationQueue: Queue
  ) {}

  async create(dto: CreateCompetitionDto) {
    this.logger.log(`Creating new competition: ${dto.title}`);
    return this.prisma.competition.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        tags: dto.tags ?? [],
        capacity: dto.capacity,
        regDeadline: new Date(dto.regDeadline),
      },
    });
  }

  async findAll() {
    this.logger.log('Fetching all competitions...');
    return this.prisma.competition.findMany({
      include: { registrations: { select: { id: true, userId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    this.logger.log(`Finding competition with ID: ${id}`);
    return this.prisma.competition.findUnique({ where: { id } });
  }

  async registerUser(competitionId: number, userId: number, idempotencyKey: string) {
    this.logger.log(`Attempting registration: user=${userId}, competition=${competitionId}`);

    if (!idempotencyKey) throw new BadRequestException('Missing Idempotency-Key header');

    return this.prisma.$transaction(async (tx) => {
      // Step 1: Check competition validity
      const competition = await tx.competition.findUnique({
        where: { id: competitionId },
        include: { registrations: true },
      });
      if (!competition) throw new BadRequestException('Competition not found');
      if (new Date(competition.regDeadline) < new Date())
        throw new BadRequestException('Registration deadline passed');
      if (competition.registrations.length >= competition.capacity)
        throw new ConflictException('Competition is full');

      // Step 2: Idempotency check
      const existing = await tx.registration.findUnique({ where: { idempotencyKey } });
      if (existing) {
        this.logger.warn(`Duplicate idempotency key: ${idempotencyKey}`);
        return existing;
      }

      // Step 3: Duplicate user check
      const alreadyRegistered = await tx.registration.findFirst({
        where: { competitionId, userId },
      });
      if (alreadyRegistered)
        throw new ConflictException('Already registered for this competition');

      // Step 4: Create registration
      const registration = await tx.registration.create({
        data: { userId, competitionId, idempotencyKey },
      });
      this.logger.log(`✅ Registration created: ${registration.id}`);

      // Step 5: Queue confirmation job
      try {
        await this.registrationQueue.add(
          'confirmation',
          { registrationId: registration.id, userId, competitionId },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        );
        this.logger.log(`📤 Job added to queue for registration ${registration.id}`);
      } catch (queueErr) {
        this.logger.error(`💥 Failed to enqueue job: ${queueErr}`);
      }

      return registration;
    });
  }
}
