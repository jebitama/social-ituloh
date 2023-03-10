/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { PostEntity } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../../shared/types/base.entity';
import { PublicFile } from '../../files/entities/file.entity';
import { PostFeed } from '../../posts/entities/postFeed.entity';

export interface UserGoogleData {
  email: string;
  picture: string;
}

export interface UserOTP {
  secret: string;
  otpURL: string;
}

export interface UserValidationDto {
  readonly email: string;
  readonly password: string;
}
export interface UserTokensInterface {
  readonly user?: User;
  readonly accessToken: string;
  readonly refreshToken: string;
}
export interface UserUpdateTokensDto {
  readonly userID: number;
  readonly email: string;
  readonly refreshToken: string;
}
export interface UserJwtPayload {
  readonly id: number;
  readonly email: string;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @Column({ nullable: true })
  @IsString()
  bio: string;

  @Column({ unique: true })
  @Index()
  @IsString()
  @IsEmail()
  email: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(12)
  username: string;

  @Exclude()
  @Column({ nullable: true, length: 128 })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(12)
  password: string;

  @Exclude()
  @Column({ nullable: true, select: false })
  hashedRefreshToken: string;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) this.password = await bcrypt.hash(this.password, 10);
  }
  async validatePassword(password: string): Promise<boolean> {
    if (this.isOAuthAccount) return true;
    return bcrypt.compare(password, this.password);
  }

  @Column({ default: true })
  isActive: boolean;
  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ default: false })
  isOAuthAccount: boolean;
  @Exclude()
  @Column({ default: false })
  isGoogleAccount: boolean;
  @Exclude()
  @Column({ default: false })
  isGithubAccount: boolean;

  @Column({ default: 'avatar.webp' })
  @IsString()
  avatar: string;

  @Column({ length: 1024, nullable: true })
  description: string;

  @Column({ length: 64, nullable: true })
  phone: string;
  @Column({ length: 64, nullable: true })
  gender: string;

  @OneToMany(() => Comment, (comment) => comment.author, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => PostEntity, (post) => post.author, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  posts: PostEntity[];

  @OneToMany(() => PostFeed, (pf) => pf.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  postFeed: PostFeed[];

  @OneToMany(() => PublicFile, (file) => file.user)
  files: PublicFile[];

  postsNumber?: number;
}
