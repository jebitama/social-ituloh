/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate/index';

import { FilesService } from '../files/files.service';
import { PostEntity } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';
import { PostFeed } from './entities/postFeed.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private posts: Repository<PostEntity>,

    @InjectRepository(PostFeed)
    private postFeed: Repository<PostFeed>,

    @InjectRepository(Comment)
    private postComments: Repository<Comment>,

    @Inject(FilesService)
    private readonly filesService: FilesService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getAll(
    queryOptions: IPaginationOptions = { page: 1, limit: 10 },
    tag = '',
    userID: number,
  ): Promise<Pagination<PostEntity>> {
    const currentUser = await this.usersService.getByID(userID);

    if (!tag) {
      const userPostFeed = await this.postFeed
        .createQueryBuilder('feed')
        .leftJoinAndSelect('feed.post', 'post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('author.avatar', 'avatar')
        .leftJoinAndSelect('post.file', 'file')

        .where('feed.user.id = :userID', { userID })
        .orderBy('feed.createdAt', 'DESC')

        .take(Number(queryOptions.limit))
        .skip((Number(queryOptions.page) - 1) * Number(queryOptions.limit))
        .getMany();
      const feedPosts = userPostFeed.map((f) => f.post);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentOwnPosts =
        Number(queryOptions.page) === 1
          ? await this.posts
              .createQueryBuilder('post')
              .leftJoinAndSelect('post.author', 'author')
              .leftJoinAndSelect('author.avatar', 'avatar')
              .leftJoinAndSelect('post.file', 'file')
              .leftJoinAndSelect('post.tags', 'tags')
              .where('author.id = :userID', { userID })
              .andWhere('post.createdAt > :yesterday', { yesterday })
              .orderBy('post.createdAt', 'DESC')
              .take(5)
              .getMany()
          : [];
      const allPosts = [...recentOwnPosts, ...feedPosts];

      const formattedFeedPosts = (await Promise.all(
        allPosts.map(async (p) => this.formatPost(p, currentUser)),
      )) as PostEntity[];

      if (formattedFeedPosts.length)
        return {
          items: formattedFeedPosts,
          meta: {
            currentPage: Number(queryOptions.page),
            itemCount: formattedFeedPosts.length,
            itemsPerPage: Number(queryOptions.limit),
            // TODO: is it has any sense to make real pagination values?
            totalItems: 50,
            totalPages: 10,
          },
        };
    }

    const queryBuilder = this.posts
      .createQueryBuilder()
      .select('post')
      .from(PostEntity, 'post')
      .leftJoin('post.likes', 'likes')
      .leftJoin('post.comments', 'comments')
      .addSelect(
        'COUNT(likes) + COUNT(comments) * 5 / (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM post.createdAt))',
        'score',
      )
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.avatar', 'avatar')
      .leftJoinAndSelect('post.file', 'file')
      .leftJoinAndSelect('post.tags', 'tags')
      .orderBy('score', 'DESC')
      .groupBy('post.id')
      .addGroupBy('author.id')
      .addGroupBy('avatar.id')
      .addGroupBy('file.id')
      .addGroupBy('tags.id');

    // TODO: not working
    if (tag) queryBuilder.where('tags.name IN :tag', { tag });
    // if (tag) queryBuilder.where(':tag IN post.tags', { tag });
    else {
      const postsFeed = await this.postFeed
        .createQueryBuilder('feed')
        .select('feed.id')
        .where('feed.user.id = :userID', { userID })
        .getMany();
      const postsFeedIDs = postsFeed.map((pf) => pf.id);
      // TODO: not working. there are still post duplicates
      if (postsFeedIDs.length)
        queryBuilder.where('post.id NOT IN (:...postsFeedIDs)', {
          postsFeedIDs,
        });
    }

    const { items, meta } = await paginate<PostEntity>(
      queryBuilder,
      queryOptions,
    );

    const formattedPosts = (await Promise.all(
      items.map(async (p) => this.formatPost(p, currentUser)),
    )) as PostEntity[];
    return { items: formattedPosts, meta };
  }
  async formatPost(p: PostEntity, currentUser: User): Promise<PostEntity> {
    const postComments: Comment[] = await this.postComments.find({
      where: { post: Equal(p) },
    });
    return {
      ...p,
      author: {
        ...p.author,
      },
      comments: postComments,
    } as PostEntity;
  }

  async getByID(id: number): Promise<PostEntity> {
    // return await this.posts.findOneOrFail(id, { relations: ['users', 'tags'] });
    return await this.posts.findOneOrFail({
      where: { id },
      relations: { author: true },
    });
  }

  async getComments(id: number, currentUserID: number): Promise<Comment[]> {
    const currentUserRootComments = await this.postComments
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('author.avatar', 'avatar')
      .where('comment.author.id = :currentUserID', { currentUserID })
      .andWhere('comment.post.id = :postID', { postID: id })
      .andWhere('comment.parentComment IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
    const restRootComments = await this.postComments
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('author.avatar', 'avatar')
      .where('comment.author.id != :currentUserID', { currentUserID })
      .andWhere('comment.post.id = :postID', { postID: id })
      .andWhere('comment.parentComment IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
    const allComments = [...currentUserRootComments, ...restRootComments];

    return allComments;
  }

  // async findCommentTree(comments:Comment[]):Promise<Comment[]>{
  //       const treeRepository = appDataSource.manager.getTreeRepository(Comment);

  //   return comments.map(async (comment) => {
  //     // TODO: missing typeorm types?
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     // TODO: missing author relation
  //     const newComent: Partial<Comment[]>, {replies} = await treeRepository.findDescendantsTree(comment, {relations:{author:true}});

  //     return {
  //       ...newComent,
  //       replies
  //     }
  //   })
  // }

  async create(
    files: Array<Express.Multer.File>,
    payload: CreatePostDto,
    userID: number,
  ): Promise<PostEntity> {
    const user = await this.usersService.getByID(userID);
    const post = await this.posts.save({
      description: payload.description,
      author: user,
    });

    try {
      const savedPost = await this.posts.save({
        ...post,
      });

      const allUser = await this.usersService.getAll('', userID);
      console.log('allUser', allUser);
      await Promise.all(
        allUser.map(async (user) => {
          if (user.id !== userID) {
            // TODO: move to queue?
            await this.postFeed.save({
              user: user,
              post: savedPost,
            });

            const feedCount = await this.postFeed.count({
              where: { user: Equal(user) },
            });
            console.log('feedCount', feedCount);
            const maxUserFeedNumber = 20;
            if (feedCount > maxUserFeedNumber) {
              const oldestPost = await this.postFeed.findOne({
                where: { user: Equal(user) },
                order: { createdAt: 'ASC' },
              });
              await this.postFeed.delete(oldestPost.id);
            }
          }
        }),
      );
    } catch (e) {
      console.log(e);
    }

    return post;
  }

  async update(id: number, payload: UpdatePostDto): Promise<PostEntity> {
    const toUpdate = await this.posts.findOneOrFail({ where: { id } });
    const updated = this.posts.create({ ...toUpdate, ...payload });
    await this.posts.save(updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.posts.delete(id);
  }

  async share(id: number, userID: number): Promise<void> {
    console.log('share', id, userID);
  }
}
