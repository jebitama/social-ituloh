/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude } from 'class-transformer';
import { IsString, IsUrl } from 'class-validator';
import { PostEntity } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PublicFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @Column({ nullable: true })
  @IsUrl()
  url: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @ManyToOne(() => PostEntity, (p) => p.files)
  post: PostEntity;

  @Exclude()
  @ManyToOne(() => User, (user) => user.files)
  user: User;
}
