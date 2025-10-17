import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();  // connects Prisma to your database
  }

  async onModuleDestroy() {
    await this.$disconnect();  // closes connection when app stops
  }
}
