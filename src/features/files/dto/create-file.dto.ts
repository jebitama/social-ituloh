/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseEntity } from '../../../shared/types/base.entity';
import { Column, Entity } from 'typeorm';

export interface UploadFileOptions {
  file: Express.Multer.File;
  quality: number;
  imageMaxSizeMB: number;
  type: 'image' | 'video';
}

@Entity()
export class File extends BaseEntity {
  @Column()
  url: string;

  @Column()
  key: string;
}
