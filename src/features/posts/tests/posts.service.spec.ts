import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { PostEntity } from '../entities/post.entity';
import { PostFeed } from '../entities/postFeed.entity';
import { PostsModule } from '../posts.module';
import { PostsService } from '../posts.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PostsModule,
        TypeOrmModule.forFeature([PostEntity, Comment, PostFeed]),
      ],
      providers: [PostsService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
