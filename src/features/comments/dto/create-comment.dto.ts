/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNumber()
  @IsNotEmpty()
  postID: number;

  @IsNumber()
  replyCommentID?: number;
}
