import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { PostEntity } from '../entities/post.entity';
import { PostFeed } from '../entities/postFeed.entity';
import { PostsController } from '../posts.controller';
import { PostsModule } from '../posts.module';
import { PostsService } from '../posts.service';

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PostsModule,
        TypeOrmModule.forFeature([PostEntity, Comment, PostFeed]),
      ],
      controllers: [PostsController],
      providers: [PostsService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
