/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UsersController {
  constructor(private readonly userServices: UsersService) {}

  @Get()
  async getAll(
    @Query('search') search: string,
    @Request() req,
  ): Promise<User[]> {
    return await this.userServices.getAll(search, req.user.id);
  }

  @Get('me')
  async getSelf(@Request() req): Promise<User> {
    return await this.userServices.getByID(req.user.id);
  }

  @Public()
  @Get('is-username-taken')
  async isUsernameTaken(@Query('username') username: string): Promise<boolean> {
    return await this.userServices.isUsernameTaken(username);
  }
  @Public()
  @Get('is-email-taken')
  async isEmailTaken(@Query('email') email: string): Promise<boolean> {
    return await this.userServices.isEmailTaken(email);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/users/image',
        filename: (req, file, callback) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = extname(file.originalname);
          const randomName = Array(4)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, `${name}-${randomName}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
          // throw new Error('please uplaod image only hihihihi');
          return callback(
            new Error('Only image files are allowed! hihihihihi'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<User> {
    return await this.userServices.setUserImage(file, req.user.id);
  }

  @Get(':username')
  async getProfileByUsername(
    @Param('username') username: string,
    @Request() req,
  ): Promise<User> {
    return await this.userServices.getProfileByUsername(username, req.user.id);
  }
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() payload: Partial<User>,
  ): Promise<User> {
    return await this.userServices.update(+id, payload);
  }
}
