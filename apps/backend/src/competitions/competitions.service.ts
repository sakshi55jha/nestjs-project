import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class CompetitionsService {
  constructor(private prisma: PrismaService,
    @InjectQueue('registration') private registrationQueue: Queue,
  ) {}

  async create(dto: CreateCompetitionDto) {
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
  return this.prisma.competition.findMany({
  include: { registrations: { select: { id: true, userId: true } } },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

  async findOne(id: number) {
    return this.prisma.competition.findUnique({
      where: { id },
    });
  }

  async registerUser(competitionId: number, userId: number, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Missing Idempotency-Key header');
    }

    return this.prisma.$transaction(async (tx) => {
      const competition = await tx.competition.findUnique({
        where: { id: competitionId },
        include: { registrations: true },
      });

      if (!competition) throw new BadRequestException('Competition not found');
      if (new Date(competition.regDeadline) < new Date())
        throw new BadRequestException('Registration deadline passed');

      if (competition.registrations.length >= competition.capacity)
        throw new ConflictException('Competition is full');

      const existing = await tx.registration.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing;

      const alreadyRegistered = await tx.registration.findFirst({
        where: { competitionId, userId },
      });
      if (alreadyRegistered)
        throw new ConflictException('Already registered for this competition');

      const registration = await tx.registration.create({
        data: {
          userId,
          competitionId,
          idempotencyKey,
        },
      });

        // --- enqueue confirmation job (job options include attempts + backoff)
      await this.registrationQueue.add(
        'confirmation', // job name
        { registrationId: registration.id, userId, competitionId },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 }, // 3s -> 6s -> 12s...
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      return registration;
    });
  }

}
