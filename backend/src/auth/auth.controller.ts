import { Controller, Post, Body, HttpStatus, HttpCode, Get, Res, Req } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, AuthResponseDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { AuthUser } from './strategies/jwt.strategy';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    return await this.authService.signIn(signInDto, res);
  }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user account' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user already exists',
  })
  async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    return await this.authService.signUp(signUpDto, res);
  }

  @Public()
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({
    status: 200,
    description: 'User signed out successfully',
    type: AuthResponseDto,
  })
  async signOut(@Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    return await this.authService.signOut(res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public() // Allow public access for token refresh
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const refreshToken = req.cookies?.refresh_token;
    return await this.authService.refreshToken(refreshToken, res);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile (Session Protected)' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - No user session found' })
  getCurrentUser(@User() user: any) {
    // Format user object to match the expected structure with snake_case fields
    const formattedUser = {
      id: user.id,
      auth_id: user.authId,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      full_name: `${user.firstName} ${user.lastName}`.trim(),
      institution: user.institution,
      field_of_study: user.fieldOfStudy,
    };

    return {
      success: true,
      user: formattedUser,
      message: 'Current user retrieved successfully',
    };
  }
}
