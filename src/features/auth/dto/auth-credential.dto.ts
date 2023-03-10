/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class AuthCredentialDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid username',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password: string;
}
