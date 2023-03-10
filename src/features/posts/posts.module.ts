/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

import { FilesModule } from '../files/files.module';
import { Comment } from '../comments/entities/comment.entity';
import { PostEntity } from './entities/post.entity';
import { PostFeed } from './entities/postFeed.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, Comment, PostFeed]),
    FilesModule,
    forwardRef(() => UsersModule),
  ],
  exports: [PostsService],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
