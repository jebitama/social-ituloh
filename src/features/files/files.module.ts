/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { PublicFile } from './entities/file.entity';
import { FilesService } from './files.service';

@Module({
  imports: [TypeOrmModule.forFeature([PublicFile, PostEntity, User])],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
