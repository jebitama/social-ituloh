/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { UsersModule } from '../users/users.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, PostEntity]),
    forwardRef(() => UsersModule),
  ],
  providers: [CommentsService],
  exports: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
