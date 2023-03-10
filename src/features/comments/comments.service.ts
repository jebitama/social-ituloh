/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { UsersService } from '../users/users.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(PostEntity)
    private posts: Repository<PostEntity>,

    @InjectRepository(Comment)
    private postComments: Repository<Comment>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}
  async createComment(
    { text, postID, replyCommentID }: CreateCommentDto,
    userID: number,
  ): Promise<Comment> {
    const user = await this.usersService.getByID(userID);
    const post = await this.posts.findOneOrFail({ where: { id: postID } });
    const parentComment = replyCommentID
      ? await this.postComments.findOneOrFail({
          where: { postID: replyCommentID },
        })
      : null;

    const comment = await this.postComments.save({
      text,
      post,
      author: user,
      parentComment,
    });

    delete comment.post;
    delete comment.parentComment;
    return { ...comment, postID } as Comment;
  }
  async updateComment(id: number, text: string): Promise<Comment> {
    const toUpdate = await this.postComments.findOneOrFail({
      where: { postID: id },
      relations: { post: true },
    });
    const updated = this.postComments.create({ ...toUpdate, text });
    await this.postComments.save(updated);

    const postID = updated.post.id;
    delete updated.post;
    delete updated.parentComment;
    return { ...updated, postID } as Comment;
  }
  async deleteComment(id: number): Promise<void> {
    await this.postComments.delete(id);
  }
}
