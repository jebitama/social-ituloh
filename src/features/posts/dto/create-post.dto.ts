/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  description: string;
}
