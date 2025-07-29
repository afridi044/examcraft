import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

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