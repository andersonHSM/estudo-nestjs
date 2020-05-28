import { JwtMiddleware } from './jwt.middleware';
import { JwtService } from '@nestjs/jwt';

describe('JwtMiddleware', () => {
  let jwtService: JwtService;
  beforeEach(() => {
    jwtService = new JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    });
  });
  it('should be defined', () => {
    expect(new JwtMiddleware(jwtService)).toBeDefined();
  });
});
