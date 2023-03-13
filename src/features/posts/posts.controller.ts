/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { Comment } from '../comments/entities/comment.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilesService } from '../files/files.service';

@Controller('v1/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly fileService: FilesService,
  ) {}

  @Get()
  async getAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('tab') tab = '',
    @Request() req,
  ): Promise<Pagination<PostEntity>> {
    return await this.postsService.getAll({ page, limit }, tab, req.user.id);
  }

  @Get(':id')
  async getByID(@Param('id') id: number): Promise<PostEntity> {
    return await this.postsService.getByID(+id);
  }
  @Get('comments/:id')
  async getComments(
    @Param('id') id: number,
    @Request() req,
  ): Promise<Comment[]> {
    return await this.postsService.getComments(+id, req.user.id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @UploadedFile() files: Array<Express.Multer.File>,
    @Body() payload: CreatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    const newPost = await this.postsService.create(files, payload, req.user.id);
    const uploadedFiles = await this.fileService.create(
      files,
      req.user,
      newPost.id,
    );
    newPost.files = uploadedFiles;
    return newPost;
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() postData: UpdatePostDto,
  ): Promise<PostEntity> {
    return await this.postsService.update(+id, postData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return await this.postsService.delete(+id);
  }

  @Post('share/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async share(@Param('id') id: number, @Request() req): Promise<void> {
    return await this.postsService.share(+id, req.user.id);
  }
}
