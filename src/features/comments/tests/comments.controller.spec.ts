import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { PostsModule } from '../../posts/posts.module';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { Comment } from '../entities/comment.entity';

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PostsModule, TypeOrmModule.forFeature([Comment, PostEntity])],
      controllers: [CommentsController],
      providers: [CommentsService],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
