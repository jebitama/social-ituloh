/* eslint-disable @typescript-eslint/no-unused-vars */
import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @MaxLength(64)
  phone?: string;

  @IsString()
  @MaxLength(64)
  gender?: string;

  @IsString()
  @MaxLength(64)
  bio?: string;
}
