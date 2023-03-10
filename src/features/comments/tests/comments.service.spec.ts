import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { PostsService } from '../../posts/posts.service';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { CommentsService } from '../comments.service';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { RootTestModule } from '../../root.test.module';
import { PostFeed } from '../../posts/entities/postFeed.entity';
import { FilesService } from '../../files/files.service';
import { PublicFile } from '../../files/entities/file.entity';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let usersService: UsersService;

  let commentsRepository: Repository<Comment>;
  let postsRepository: Repository<PostEntity>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RootTestModule],
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useClass: Repository,
        },
        PostsService,
        {
          provide: getRepositoryToken(PostFeed),
          useClass: Repository,
        },
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        FilesService,
        {
          provide: getRepositoryToken(PublicFile),
          useClass: Repository,
        },
      ],
    }).compile();
    // user services
    commentsService = module.get<CommentsService>(CommentsService);
    usersService = module.get<UsersService>(UsersService);

    // used repositories
    commentsRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    postsRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );
  });

  // it('should be defined all needed services (comments, posts, users)', () => {
  //   expect(commentsService).toBeDefined();
  //   expect(postsService).toBeDefined();
  //   expect(usersService).toBeDefined();
  // });
  describe('getUser', () => {
    const userAlice = {
      id: 2,
      name: 'Alice',
      email: 'alice@user.test',
      username: 'useralice',
    };
    it('should get user who will comment on post', async () => {
      const result = await usersService.getByID(2);
      expect(result).toContainEqual(userAlice);
    });
  });

  describe('getPost by id', () => {
    const post = { id: 2, description: 'alice post', authorId: 1 };
    it('should get post by id', async () => {
      const options: FindOneOptions<PostEntity> = { where: { id: 2 } };
      const result = await jest
        .spyOn(postsRepository, 'findOneOrFail')
        .mockResolvedValue(options as PostEntity);
      expect(result).toEqual(post);
    });
  });

  describe('createComment', () => {
    const user = {
      id: 2,
      name: 'Alice',
      email: 'alice@user.test',
      username: 'useralice',
    };
    const post = { id: 1, description: 'alice post', authorId: 1 };
    const parentComment = {
      id: 2,
      text: 'jhon comment',
      postId: post.id,
      author: user,
    };
    const newComment = {
      id: 3,
      text: 'alice comment',
      postID: post.id,
      post: post,
      author: user,
      parentComment: parentComment as DeepPartial<Comment>,
    } as unknown as Comment;

    it('should create comment on post by id and user as author', async () => {
      jest.spyOn(commentsRepository, 'save').mockResolvedValue(newComment);
      const result = await commentsService.createComment(
        {
          text: 'alice comment',
          postID: 2,
          replyCommentID: 2,
        },
        3,
      );
      expect(result).toEqual(newComment);
    });
  });
});
