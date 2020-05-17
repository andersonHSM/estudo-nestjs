import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';

import { JwtAuthGuard } from './app/features/auth/guards/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async testJwt(@Request() req) {
    return req.user;
  }
}
