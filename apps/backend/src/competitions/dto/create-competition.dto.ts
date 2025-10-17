import { IsString, IsInt, IsOptional, IsArray, IsISO8601, Min, MaxLength } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsInt()
  @Min(1)
  capacity: number;

  @IsISO8601()
  regDeadline: string;
}
