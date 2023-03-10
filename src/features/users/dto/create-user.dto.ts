/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsNotEmpty()
  @MaxLength(24)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateUserGithubDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsNotEmpty()
  @MaxLength(24)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
