import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: () => void) {
    const { authorization: authHeader } = req.headers;

    if (!authHeader) {
      throw new HttpException(
        { error: 'Authorization header not provided.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(403).json({ error: 'Token not provided' });
    }

    try {
      const { userId } = this.jwtService.verify(token);
      req.user = userId;
      next();
    } catch (err) {
      throw new HttpException({ err }, HttpStatus.BAD_REQUEST);
    }
  }
}
