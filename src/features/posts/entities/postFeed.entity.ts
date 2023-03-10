/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../../../src/shared/types/base.entity';
import { Entity, Index, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity()
export class PostFeed extends BaseEntity {
  @Index()
  @ManyToOne(() => User, (u) => u.postFeed, {
    cascade: true,
  })
  user: User;

  @ManyToOne(() => PostEntity, (p) => p.feeds, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  post: PostEntity;
}
