import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateExamDto {
  @ApiProperty({
    description: 'Exam title',
    example: 'Computer Science Midterm Exam',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Exam description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Existing topic ID' })
  @IsOptional()
  @IsUUID()
  topic_id?: string;

  @ApiPropertyOptional({ description: 'Custom topic name' })
  @IsOptional()
  @IsString()
  custom_topic?: string;

  @ApiProperty({ description: 'Topic name for AI prompt' })
  @IsString()
  @IsNotEmpty()
  topic_name: string;

  @ApiProperty({ description: 'Difficulty level (1-5)', example: 3 })
  @IsNumber()
  difficulty: number;

  @ApiProperty({ description: 'Number of questions to generate', example: 20 })
  @IsNumber()
  num_questions: number;

  @ApiProperty({ description: 'Exam duration in minutes', example: 60 })
  @IsNumber()
  duration_minutes: number;

  @ApiPropertyOptional({ 
    description: 'Passing score percentage', 
    example: 70 
  })
  @IsOptional()
  @IsNumber()
  passing_score?: number;

  @ApiProperty({
    description: 'Types of questions to generate',
    example: ['multiple-choice', 'true-false', 'short-answer'],
  })
  @IsArray()
  @IsString({ each: true })
  question_types: string[];

  @ApiPropertyOptional({ description: 'Content source for AI' })
  @IsOptional()
  @IsString()
  content_source?: string;

  @ApiPropertyOptional({ description: 'Additional instructions for AI' })
  @IsOptional()
  @IsString()
  additional_instructions?: string;
} 