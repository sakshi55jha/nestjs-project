import { 
  Controller, Post, Body, Get, Param, UseGuards, Req, Headers 
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('api/competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  // Create a new competition
  @Post()
  async create(@Body() dto: CreateCompetitionDto) {
    return this.competitionsService.create(dto);
  }

  // Get all competitions
  @Get()
  async findAll() {
    return this.competitionsService.findAll();
  }

  // Get single competition by ID
  @Get(':id')
 async findOne(@Param('id') id: string) {
  const competitionId = parseInt(id, 10);
  if (isNaN(competitionId)) {
    throw new Error('Invalid competition ID');
  }
  return this.competitionsService.findOne(competitionId);
}

 // New Register Endpoint
  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Param('id') id: string,
    @Req() req,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    const userId = req.user.userId;
    return this.competitionsService.registerUser(Number(id), userId, idempotencyKey);
  }

}
