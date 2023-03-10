import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserJwtPayload } from '../../users/entities/user.entity';
import { environments } from '../../../../src/environtments/environtments';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environments.accessTokenSecret,
    });
  }

  async validate(payload: UserJwtPayload): Promise<UserJwtPayload> {
    return payload;
  }
}
