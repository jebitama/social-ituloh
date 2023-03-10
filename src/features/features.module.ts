/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { MulterModule } from '@nestjs/platform-express';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostsModule,
    FilesModule,
    MulterModule.register({ dest: './uploads' }),
    CommentsModule,
  ],
  exports: [
    AuthModule,
    UsersModule,
    PostsModule,
    FilesModule,
    MulterModule.register({ dest: './uploads' }),
    CommentsModule,
  ],
})
export class FeaturesModule {}
