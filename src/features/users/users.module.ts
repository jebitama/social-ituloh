/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { PostsModule } from '../posts/posts.module';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PublicFile } from '../files/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PublicFile]),
    FilesModule,
    forwardRef(() => PostsModule),
  ],
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
