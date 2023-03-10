/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { PublicFile } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private fileRepository: Repository<PublicFile>,
    @InjectRepository(PostEntity)
    private postReporistoy: Repository<PostEntity>,
  ) {}

  async create(files: Array<Express.Multer.File>, user: User, postID?: number) {
    console.log('INSIDE CREATE METHOD OF IMAGES SERVICE');
    const post = await this.postReporistoy.findOne({ where: { id: postID } });
    const returnPublicFiles = [];
    files.forEach(async (file) => {
      const newPublicFile = this.fileRepository.create({ name: file.filename });
      // newPublicFile.name = file.filename;
      newPublicFile.createdAt = `${Date.now()}`;
      newPublicFile.updatedAt = `${Date.now()}`;
      newPublicFile.user = user;
      newPublicFile.post = post;
      const imgObj = {
        id: newPublicFile.id,
        name: newPublicFile.name,
        createdAt: newPublicFile.createdAt,
        updatedAt: newPublicFile.updatedAt,
        user: newPublicFile.user,
        post: newPublicFile.post,
      };
      returnPublicFiles.push(imgObj);
      await this.fileRepository.save(newPublicFile);
    });

    console.log(returnPublicFiles);
    return returnPublicFiles;
  }
}
