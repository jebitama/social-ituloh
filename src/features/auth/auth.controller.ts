/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  UserTokensInterface,
  UserUpdateTokensDto,
} from '../users/entities/user.entity';

@Public()
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Request() req): Promise<UserTokensInterface> {
    return await this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() payload: CreateUserDto): Promise<UserTokensInterface> {
    const user = await this.authService.register(payload);
    return await this.authService.login(user);
  }

  @Post('refresh_token')
  async updateTokens(
    @Body() payload: UserUpdateTokensDto,
  ): Promise<UserTokensInterface> {
    return await this.authService.updateTokens(payload);
  }

  @HttpCode(200)
  @Post('google-auth')
  async authWithGoogle(
    @Body('token') token: string,
  ): Promise<UserTokensInterface> {
    return await this.authService.authWithGoogle(token);
  }
  @HttpCode(200)
  @Post('github-auth')
  async authWithGithub(
    @Body('code') code: string,
  ): Promise<UserTokensInterface> {
    return await this.authService.authWithGithub(code);
  }
}
