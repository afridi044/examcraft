import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Title of the study note',
    example: 'JavaScript Fundamentals',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Content of the study note',
    example: 'JavaScript is a programming language that is one of the core technologies of the World Wide Web...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Existing topic ID (parent topic)' })
  @IsOptional()
  @IsUUID()
  topic_id?: string;

  @ApiPropertyOptional({ description: 'Subtopic name (child of selected topic)' })
  @IsOptional()
  @IsString()
  subtopic_name?: string;

  @ApiPropertyOptional({ description: 'Topic name for display' })
  @IsOptional()
  @IsString()
  topic_name?: string;

  // Custom validation to ensure proper topic selection
  @ValidateIf((o) => !o.topic_id)
  @IsNotEmpty({ message: 'topic_id is required' })
  _topicValidation?: string;

  @ValidateIf((o) => o.subtopic_name && !o.topic_id)
  @IsNotEmpty({ message: 'Parent topic_id is required when providing subtopic_name' })
  _subtopicValidation?: string;
} 