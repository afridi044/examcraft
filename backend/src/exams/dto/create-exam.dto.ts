import { IsString, IsInt, IsOptional, IsUUID, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({
    description: 'User ID who creates the exam',
    example: 'user-uuid-here'
  })
  @IsString()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Exam title',
    example: 'Final Mathematics Exam'
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Exam description',
    example: 'Comprehensive exam covering algebra, calculus, and statistics'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Exam duration in minutes',
    example: 120,
    minimum: 1,
    maximum: 600
  })
  @IsInt()
  @Min(1)
  @Max(600) // Max 10 hours
  duration_minutes: number;

  @ApiPropertyOptional({
    description: 'Passing score percentage',
    example: 70,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passing_score?: number;

  @ApiPropertyOptional({
    description: 'Topic ID for the exam',
    example: 'topic-uuid-here'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  topic_id?: string;

  @ApiProperty({
    description: 'Array of question IDs to include in the exam',
    example: ['question-uuid-1', 'question-uuid-2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  question_ids: string[];
} 