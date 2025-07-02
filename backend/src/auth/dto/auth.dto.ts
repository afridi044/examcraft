import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class SignUpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty({ example: 'University of Technology', required: false })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiProperty({ example: 'Computer Science', required: false })
  @IsString()
  @IsOptional()
  field_of_study?: string;
}

export class AuthResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  user?: {
    id: string;
    auth_id: string;
    email: string;
    full_name?: string;
  };

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  error?: string;
}
