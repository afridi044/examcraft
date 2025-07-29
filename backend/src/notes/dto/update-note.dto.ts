import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Title of the study note',
    example: 'JavaScript Fundamentals',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Content of the study note',
    example: 'JavaScript is a programming language that is one of the core technologies of the World Wide Web...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Topic or subject of the note',
    example: 'JavaScript',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  topic?: string;
} 