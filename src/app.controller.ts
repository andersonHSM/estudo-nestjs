import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Res() res: Response) {
    res.status(HttpStatus.OK).json(await this.appService.getData());
  }

  @Post()
  async create(@Body() user, @Res() res: Response) {
    // console.log(await this.appService.createUser(user));

    // res.send();
    const [userReturned] = await this.appService.createUser(user);
    return res.status(HttpStatus.OK).json({ user: userReturned });
  }
}
