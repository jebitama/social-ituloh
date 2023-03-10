/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../../src/shared/types/base.entity';
import { User } from '../../users/entities/user.entity';
import { PublicFile } from '../../files/entities/file.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PostFeed } from './postFeed.entity';

@Entity()
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'authorID' })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
  })
  comments: Comment[];
  commentsNumber: number;

  @Column({ type: 'boolean', default: false })
  isVideo: boolean;

  @OneToMany(() => PostFeed, (pf) => pf.post, {
    cascade: true,
  })
  feeds: PostFeed[];

  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
  })
  @OneToMany(() => PublicFile, (pf) => pf.post)
  files: PublicFile[];

  isViewerLiked: boolean;
}
