import { AuthService } from '../auth.service';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { ExecutionContext } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

describe('The AuthenticationService', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [UsersService, AuthService, JwtService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'abc123', email: 'test@test.com' }; // Your user object
          return true;
        },
      })
      .compile();
    service = await module.get(AuthService);
  });

  describe('AuthService', () => {
    it('should throw not found error on login if no such user ', () => {
      expect(
        typeof service.validateUser({
          email: 'test@test.com',
          password: 'test',
        }),
      ).rejects.toThrow();
    });
  });
});
