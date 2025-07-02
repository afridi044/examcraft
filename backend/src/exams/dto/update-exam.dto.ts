import { IsString, IsInt, IsOptional, IsUUID, Min, Max, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExamDto {
  @ApiPropertyOptional({
    description: 'Exam title',
    example: 'Updated Mathematics Exam'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Exam description',
    example: 'Updated comprehensive exam covering advanced topics'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Exam duration in minutes',
    example: 150,
    minimum: 1,
    maximum: 600
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600)
  duration_minutes?: number;

  @ApiPropertyOptional({
    description: 'Passing score percentage',
    example: 75,
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

  @ApiPropertyOptional({
    description: 'Array of question IDs to include in the exam',
    example: ['question-uuid-1', 'question-uuid-2'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  question_ids?: string[];
} 