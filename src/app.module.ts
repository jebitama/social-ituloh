/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ClassSerializerInterceptor,
  HttpException,
  Module,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { FeaturesModule } from './features/features.module';
import { CoreModule } from './core/core.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './features/users/entities/user.entity';
import { PostEntity } from './features/posts/entities/post.entity';
import { PublicFile } from './features/files/entities/file.entity';
import { Comment } from './features/comments/entities/comment.entity';
import { environments } from './environtments/environtments';
import { PostFeed } from './features/posts/entities/postFeed.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { JwtAuthGuard } from './features/auth/guard/jwt-auth.guard';

@Module({
  imports: [
    FeaturesModule,
    CoreModule,
    ConfigModule.forRoot(),
    RavenModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        type: 'postgres',
        host: environments.dbHost,
        port: environments.dbPort,
        username: environments.dbUser,
        password: environments.dbPass,
        database: environments.dbName,
        entities: [User, PostEntity, PostFeed, Comment, PublicFile],
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        filters: [
          {
            type: HttpException,
            filter: (e: HttpException) => 500 > e.getStatus(),
          },
        ],
      }),
    },
  ],
})
export class AppModule {}
