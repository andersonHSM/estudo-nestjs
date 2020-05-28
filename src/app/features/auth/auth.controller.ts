import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body, @Res() res: Response) {
    const user = await this.authService.validateUser(body);
    const token = this.authService.login(user.id);

    return res.status(200).json({ token, user: user.id });
  }
}
