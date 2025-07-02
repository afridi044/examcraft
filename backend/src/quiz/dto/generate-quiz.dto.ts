import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateQuizDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'JavaScript Fundamentals Quiz',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Quiz description' })
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

  @ApiProperty({ description: 'Number of questions to generate', example: 10 })
  @IsNumber()
  num_questions: number;

  @ApiProperty({
    description: 'Types of questions to generate',
    example: ['multiple-choice', 'true-false'],
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

  @ApiProperty({ description: 'User ID creating the quiz' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}
