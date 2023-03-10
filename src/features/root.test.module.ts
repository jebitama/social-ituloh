/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts/./posts.controller';
import { PostsService } from './posts/posts.service';
import { PostEntity } from './posts/entities/post.entity';
import { Comment } from './comments/entities/comment.entity';
import { FilesService } from './files/files.service';
import { UsersService } from './users/users.service';
import { PostFeed } from './posts/entities/postFeed.entity';
import { environments } from '../environtments/environtments';
import { User } from './users/entities/user.entity';
import { PublicFile } from './files/entities/file.entity';
import { UsersController } from './users/users.controller';
import { CommentsController } from './comments/comments.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CommentsService } from './comments/comments.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: environments.dbHost,
      port: environments.dbPort,
      username: environments.dbUser,
      password: environments.dbPass,
      database: environments.dbName,
      entities: [User, PostEntity, PostFeed, Comment, PublicFile],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, PostEntity, Comment, PostFeed, PublicFile]),
  ],
  controllers: [
    PostsController,
    UsersController,
    CommentsController,
    AuthController,
  ],
  providers: [
    CommentsService,
    PostsService,
    FilesService,
    UsersService,
    AuthService,
    JwtService,
  ],
})
export class RootTestModule {}
