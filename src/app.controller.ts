import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Res() res: Response) {
    const usuarios = await this.appService.getData();
    res.status(HttpStatus.OK).json(usuarios);
  }

  @Post()
  async create(@Body() user, @Res() res: Response) {
    const [userReturned] = await this.appService.createUser(user);
    return res.status(HttpStatus.OK).json({ user: userReturned });
  }
}
