import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { JwtGuard } from '@shared/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser(body);
      const token = this.authService.login(user.id);

      return res.status(200).json({ token });
    } catch (error) {
      return res.status(403).json({ error: 'Invalid credentials provided.' });
    }
  }
}
