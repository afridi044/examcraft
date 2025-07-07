import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'JavaScript Fundamentals Quiz',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Quiz description',
    example: 'Test your knowledge of JavaScript basics',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Topic ID for the quiz',
    example: 'uuid-topic-id',
  })
  @IsOptional()
  @IsUUID()
  topic_id?: string;
}
