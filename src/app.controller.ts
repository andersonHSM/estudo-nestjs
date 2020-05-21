import { Controller, Get, Res, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('profile')
  testJwt(@Req() req: Request, @Res() res: Response) {
    const { user } = req;
    return res.status(200).json({ user });
  }
}
