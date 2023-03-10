/* eslint-disable @typescript-eslint/no-unused-vars */
import { PostEntity } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity()
@Tree('materialized-path')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postID' })
  post: PostEntity;
  @RelationId('post')
  postID: number;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    // TODO: we don't need comment and it's replies delete when author delete. need to make it like Habr
    // check that there is no constraints error
    // onUpdate: 'CASCADE',
    // onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorID' })
  author: User;

  @TreeParent()
  parentComment?: Comment;
  @TreeChildren()
  replies?: Comment[];
}
