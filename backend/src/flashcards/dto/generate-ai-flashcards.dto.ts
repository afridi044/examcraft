import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class GenerateAiFlashcardsDto {
  @IsUUID()
  @IsOptional()
  topic_id?: string;

  @IsString()
  @IsOptional()
  custom_topic?: string;

  @IsString()
  topic_name: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  num_flashcards: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsString()
  @IsOptional()
  content_source?: string;

  @IsString()
  @IsOptional()
  additional_instructions?: string;
}
