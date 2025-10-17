// src/competitions/competitions.module.ts
import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { PrismaService } from '../prisma.service';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [
    BullModule.registerQueue({ name: 'registration' }),
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService, PrismaService],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
