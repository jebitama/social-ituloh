/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

import { google, Auth } from 'googleapis';
import { environments } from '../../../src/environtments/environtments';
import {
  CreateUserDto,
  CreateUserGithubDTO,
} from '../users/dto/create-user.dto';
import {
  User,
  UserGoogleData,
  UserJwtPayload,
  UserTokensInterface,
  UserUpdateTokensDto,
  UserValidationDto,
} from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  oauthClient: Auth.OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    const googleClientID = environments.googleAuthClientId;
    const googleClientSecret = environments.googleAuthSecret;

    this.oauthClient = new google.auth.OAuth2(
      googleClientID,
      googleClientSecret,
    );
  }

  async validateUser({ email, password }: UserValidationDto): Promise<User> {
    const user = await this.usersService.getByEmail(email);
    if (!user)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.UNAUTHORIZED);

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) return user;
    else
      throw new HttpException(
        'USER_INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
  }

  async login(user: User): Promise<UserTokensInterface> {
    const payload: UserJwtPayload = { id: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: environments.accessTokenExpiresIn,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersService.setHashedRefreshToken(user.id, hashedRefreshToken);

    return {
      user,
      accessToken,
      refreshToken: hashedRefreshToken,
    };
  }
  async register(payload: CreateUserDto): Promise<User> {
    const user = await this.usersService.create(payload);
    // send email
    // await this.emailVerificationService.sendVerificationLink(payload.email);
    return user;
  }

  async updateTokens({
    userID,
    email,
    refreshToken,
  }: UserUpdateTokensDto): Promise<UserTokensInterface> {
    const user = await this.usersService.getByID(userID, {
      select: { hashedRefreshToken: true },
    });
    if (user.hashedRefreshToken !== refreshToken) {
      throw new HttpException('USER_EXPIRED_REFRESH', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.sign({ id: userID, email });
    const newRefreshToken = this.jwtService.sign(
      { id: userID, email },
      {
        expiresIn: environments.accessTokenExpiresIn,
      },
    );
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.setHashedRefreshToken(
      userID,
      hashedNewRefreshToken,
    );

    return {
      user,
      accessToken,
      refreshToken: hashedNewRefreshToken,
    };
  }

  async authWithGoogle(token: string): Promise<UserTokensInterface> {
    const { email } = await this.oauthClient.getTokenInfo(token);
    const user = await this.usersService.getByEmail(email);

    if (user && user.isGoogleAccount) return this.login(user);
    return this.registerWithGoogle(token, email);
  }

  async registerWithGoogle(
    token: string,
    email: string,
  ): Promise<UserTokensInterface> {
    // TODO: i can't remember but there are some problems
    // const { picture } = await this.getGoogleUserData(token);
    const user = await this.usersService.createWithGoogle(email);
    return this.login(user);
  }

  async getGoogleUserData(token: string): Promise<UserGoogleData> {
    const userClient = google.oauth2('v2').userinfo;
    this.oauthClient.setCredentials({
      access_token: token,
    });

    const { data } = await userClient.get({
      auth: this.oauthClient,
    });

    // TODO: need to get google username and name
    return {
      email: data.email,
      picture: data.picture,
    };
  }

  async authWithGithub(code: string): Promise<UserTokensInterface> {
    const authorizeURL = 'https://github.com/login/oauth/access_token';
    const authorizeParams = {
      client_id: environments.githubAuthClientId,
      client_secret: environments.githubAuthSecret,
      code,
    };
    const authorizeConfig = {
      headers: {
        accept: 'application/json',
      },
    };
    const { data: authData } = await axios.post(
      authorizeURL,
      authorizeParams,
      authorizeConfig,
    );

    const getUserURL = 'https://api.github.com/user';
    const getUserEmailsURL = 'https://api.github.com/user/emails';
    const getUserConfig = {
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
      },
    };

    const { data: githubUser } = await axios.get(getUserURL, getUserConfig);

    const { data: userEmails } = await axios.get(
      getUserEmailsURL,
      getUserConfig,
    );
    const primaryEmail = userEmails.find((item) => item.primary)?.email;

    const user = await this.usersService.getByEmail(primaryEmail);
    if (user && user.isGithubAccount) return this.login(user);
    else {
      // TODO: add avatar
      const payload = {
        name: githubUser.name,
        username: githubUser.login,
        email: primaryEmail,
        location: githubUser.location,
        company: githubUser.company,
      };
      return this.registerWithGithub(payload);
    }
  }

  async registerWithGithub(
    payload: CreateUserGithubDTO,
  ): Promise<UserTokensInterface> {
    const user = await this.usersService.createWithGithub(payload);
    return this.login(user);
  }
}
