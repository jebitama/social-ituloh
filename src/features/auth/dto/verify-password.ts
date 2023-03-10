/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password: string;
}
