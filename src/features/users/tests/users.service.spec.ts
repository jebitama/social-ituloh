/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import {
  MockType,
  repositoryMockFactory,
} from '../../../shared/mock/mock.type';

describe('UsersService', () => {
  let service: UsersService;
  let repositoryMock: MockType<Repository<User>>;

  let findOne: jest.Mock;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [FilesModule, TypeOrmModule.forFeature([User, PublicFile])],
      providers: [
        // Provide your mock instead of the actual repository
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repositoryMock = module.get(getRepositoryToken(User));
  });

  describe('when getting a user by email', () => {
    describe('and the user is matched', () => {
      let user: User;
      beforeEach(() => {
        user = new User();
        findOne.mockReturnValue(Promise.resolve(user));
      });

      it('should return the user', async () => {
        const fetchedUser = await service.getByEmail('test@test.com');
        expect(fetchedUser).toEqual(user);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      });
      it('should throw an error', async () => {
        await expect(service.getByEmail('test@test.com')).rejects.toThrow();
      });
    });
  });
  it('should find user with specific id', async () => {
    const user = { name: 'Alni', id: 123 };
    // Now you can control the return value of your mock's methods
    repositoryMock.findOne.mockReturnValue(user);
    expect(service.getByID(123)).toEqual(user);
    // And make assertions on how often and with what params your mock's methods are called
    expect(repositoryMock.findOneBy).toHaveBeenCalledWith(user.id);
  });
});
