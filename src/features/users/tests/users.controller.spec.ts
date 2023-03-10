import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicFile } from '../../files/entities/file.entity';
import { User } from '../entities/user.entity';
import { UsersController } from '../users.controller';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, TypeOrmModule.forFeature([User, PublicFile])],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
