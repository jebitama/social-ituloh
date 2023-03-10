import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { PublicFile } from '../entities/file.entity';
import { FilesService } from '../files.service';

describe('FilesService', () => {
  let service: FilesService;
  let fileRepository: Repository<PublicFile>;
  let postRepository: Repository<PostEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([PublicFile, PostEntity, User])],
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(PublicFile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PostEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepository = module.get(getRepositoryToken(PublicFile));
    postRepository = module.get(getRepositoryToken(PostEntity));
    service = new FilesService(fileRepository, postRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return uploaded file info', async () => {
    const user: User = {
      id: 1234,
      name: 'user',
      email: 'user@test.com',
    } as User;
    // prepare data, insert them to be tested
    const publicFile: PublicFile = {
      id: 1,
      name: 'avatar',
      url: 'http://localhost:3000/uploads/users/image/filename.type',
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
      user: user,
      post: null,
    } as PublicFile;

    const file = {
      originalname: 'filename',
      mimetype: '.type',
      path: '/users/image/filename.type',
      buffer: Buffer.from('whatever'), // this is required since `formData` needs access to the buffer
    } as Express.Multer.File;

    await fileRepository.save(publicFile);

    // test data retrieval itself
    expect(await service.create([file], user, null)).toEqual(publicFile);
  });
});
