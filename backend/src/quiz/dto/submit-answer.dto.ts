import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'uuid-question-id',
  })
  @IsString()
  question_id: string;

  @ApiProperty({
    description: 'Quiz ID',
    example: 'uuid-quiz-id',
  })
  @IsString()
  quiz_id: string;

  @ApiProperty({
    description: 'Selected option ID (for multiple choice questions)',
    example: 'uuid-option-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  selected_option_id?: string;

  @ApiProperty({
    description: 'Text answer (for fill-in-blank questions)',
    example: 'Answer text',
    required: false,
  })
  @IsOptional()
  @IsString()
  text_answer?: string;

  @ApiProperty({
    description: 'Whether the answer is correct',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;

  @ApiProperty({
    description: 'Time taken to answer in seconds',
    example: 30,
  })
  @IsNumber()
  time_taken_seconds: number;
} 