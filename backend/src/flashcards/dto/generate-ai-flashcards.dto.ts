import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class GenerateAiFlashcardsDto {
  @IsUUID()
  @IsOptional()
  topic_id?: string;

  @IsString()
  @IsOptional()
  subtopic_name?: string;

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

  // Custom validation to ensure proper topic selection
  @ValidateIf((o) => !o.topic_id)
  @IsNotEmpty({ message: 'topic_id is required' })
  _topicValidation?: string;

  @ValidateIf((o) => o.subtopic_name && !o.topic_id)
  @IsNotEmpty({ message: 'Parent topic_id is required when providing subtopic_name' })
  _subtopicValidation?: string;
}
