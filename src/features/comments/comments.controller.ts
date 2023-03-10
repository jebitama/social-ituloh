/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { Request } from '@nestjs/common';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('comment')
  async createComment(
    @Body() payload: CreateCommentDto,
    @Request() req,
  ): Promise<Comment> {
    return await this.commentsService.createComment(payload, req.user.id);
  }
  @Patch('comment/:id')
  async updateComment(
    @Param('id') id: number,
    @Body('text') text: string,
  ): Promise<Comment> {
    return await this.commentsService.updateComment(+id, text);
  }
  @Delete('comment/:id')
  async deleteComment(@Param('id') id: number): Promise<void> {
    return await this.commentsService.deleteComment(+id);
  }
}
