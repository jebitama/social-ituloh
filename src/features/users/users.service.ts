/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Multer } from 'multer';
import { FindOneOptions, Not, Repository } from 'typeorm';
// import { PublicFile } from '../files/entities/file.entity';

import { FilesService } from '../files/files.service';
import { PostsService } from '../posts/posts.service';
import { CreateUserDto, CreateUserGithubDTO } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @Inject(FilesService)
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
  ) {}

  async getAll(search: string, currentUserID: number): Promise<User[]> {
    if (!search.length)
      return this.users.find({
        where: {
          id: Not(currentUserID),
        },
        take: 10,
      });

    const searchResult = await this.users
      .createQueryBuilder()
      .select()
      .where('username ILIKE :search', { search: `%${search}%` })
      .orWhere('name ILIKE :search', { search: `%${search}%` })
      .orWhere('email ILIKE :search', { search: `%${search}%` })
      .getMany();
    const currentUserIndexInSearchResult = searchResult.findIndex(
      (u) => u.id === currentUserID,
    );
    if (currentUserIndexInSearchResult !== -1)
      searchResult.splice(currentUserIndexInSearchResult, 1);

    return searchResult;
  }

  async getByEmail(email: string): Promise<User> {
    return await this.users.findOne({ where: { email } });
  }
  async getByID(id: number, options: FindOneOptions<User> = {}): Promise<User> {
    return await this.users.findOneBy({ ...options, id });
  }
  async getProfileByUsername(
    username: string,
    currentUserID: number,
  ): Promise<User> {
    const user = await this.users
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('posts.file', 'file')
      .leftJoinAndSelect('posts.tags', 'tags')
      .leftJoinAndSelect('posts.likes', 'likes')
      .orderBy('posts.createdAt', 'DESC')
      .getOneOrFail();

    const formattedPosts = await Promise.all(
      user.posts.map(async (p) => {
        return {
          ...p,
        };
      }),
    );
    return {
      ...user,
      posts: formattedPosts,
    } as unknown as User;
  }

  async create(payload: CreateUserDto): Promise<User> {
    console.log('payload: ', payload);
    const isUserAlreadyExist = await this.users.findOne({
      where: { email: payload.email },
    });
    if (isUserAlreadyExist)
      throw new HttpException('USER_ALREADY_EXIST', HttpStatus.BAD_REQUEST);
    console.log('isUserExist', isUserAlreadyExist);

    const user = await this.users.create(payload);
    console.log('user', user);
    return await this.users.save(user);
  }
  async createWithGoogle(email: string): Promise<User> {
    // TODO: need to get google username and name
    const emailFirstPart = email.split('@')[0];
    const user = await this.users.create({
      email,
      name: emailFirstPart,
      username: emailFirstPart,
      isOAuthAccount: true,
      isGoogleAccount: true,
      isEmailConfirmed: true,
    });
    return this.users.save(user);
  }
  async createWithGithub(payload: CreateUserGithubDTO): Promise<User> {
    const user = await this.users.create({
      ...payload,
      isOAuthAccount: true,
      isGithubAccount: true,
      isEmailConfirmed: true,
    });
    return this.users.save(user);
  }

  async update(id: number, payload: Partial<User>): Promise<User> {
    const toUpdate = await this.users.findOneOrFail({ where: { id } });
    const user = this.users.create({ ...toUpdate, ...payload });
    return await this.users.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.users.delete(id);
  }

  async setUserImage(file: Express.Multer.File, id: number): Promise<User> {
    const user = await this.users.findOneOrFail({ where: { id } });
    user.avatar = file.filename;
    await this.users.save(user);

    return user;
  }

  async deleteUserImage(id: number): Promise<void> {
    const user = await this.users.findOneOrFail({ where: { id } });
    const fileID = user.avatar;
    if (fileID) {
      await this.users.save({
        ...user,
        avatar: null,
      });
      // should remove the image
    }
  }

  async setHashedRefreshToken(
    id: number,
    hashedRefreshToken: string,
  ): Promise<void> {
    await this.users.update(id, {
      hashedRefreshToken,
    });
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.users.findOne({ where: { username } });
    return Boolean(user);
  }
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.users.findOne({ where: { email } });
    return Boolean(user);
  }

  async confirmUserEmail(email: string): Promise<boolean> {
    await this.users.update(
      { email },
      {
        isEmailConfirmed: true,
      },
    );
    return true;
  }
}
