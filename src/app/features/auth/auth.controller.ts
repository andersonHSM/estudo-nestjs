import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    // const userValid = await this.authService.validateUser(body);
    // return JSON.parse(req);
    return this.authService.login(req.user);
    // return await this.authService.validateUser(req.body);
  }
}
