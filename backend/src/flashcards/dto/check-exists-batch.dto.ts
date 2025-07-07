import { IsUUID, IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CheckFlashcardsExistBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  question_ids: string[];
}
 