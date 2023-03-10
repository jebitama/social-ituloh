import { Test, TestingModule } from '@nestjs/testing';
import { PostsModule } from '../../posts/posts.module';
import { CommentsService } from '../comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PostsModule],
      providers: [CommentsService],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
