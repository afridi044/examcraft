import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  ValidateIf,
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

  @ApiPropertyOptional({ description: 'Existing topic ID (parent topic)' })
  @IsOptional()
  @IsUUID()
  topic_id?: string;

  @ApiPropertyOptional({ description: 'Subtopic name (child of selected topic)' })
  @IsOptional()
  @IsString()
  subtopic_name?: string;

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

  // Custom validation to ensure proper topic selection
  @ValidateIf((o) => !o.topic_id)
  @IsNotEmpty({ message: 'topic_id is required' })
  _topicValidation?: string;

  @ValidateIf((o) => o.subtopic_name && !o.topic_id)
  @IsNotEmpty({ message: 'Parent topic_id is required when providing subtopic_name' })
  _subtopicValidation?: string;
}
