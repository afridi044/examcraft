import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Server is healthy',
    };
  }
}
