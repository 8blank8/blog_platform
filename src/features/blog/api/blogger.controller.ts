import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  Request,
  Put,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { CreatePostByBlogIdCommand } from '@post/usecases/create.post.by.blog.id.use.case';
import { STATUS_CODE } from '@utils/enum/status.code';
import { PostQueryParamType } from '@post/models/post.query.param.type';
import { CommentQueryRepository } from '@comment/repository/mongo/comment.query.repository';
import { CommentQueryParam } from '@comment/models/comment.query.param.type';
import { BasicAuthGuard } from '@auth/guards/basic.guard';
import { BlogQueryParamModel } from '@sa/models/blog.query.param';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { BlogCreateType } from '@blog/models/blog.create.type';
import { CreateBlogCommand } from '@blog/usecases/create.blog.use.case';
import { PostCreateByIdType } from '@blog/models/post.create.by.id.type';
import { BlogUpdateType } from '@blog/models/blog.update.type';
import { UpdateBlogCommand } from '@blog/usecases/update.blog.use.case';
import { PostUpdateByIdModel } from '@blog/models/post.update.by.id';
import { UpdatePostByBlogIdCommand } from '@blog/usecases/update.post.by.blog.id.use.case';
import { DeleteBlogCommand } from '@blog/usecases/delete.blog.use.case';
import { DeletePostByBlogIdCommand } from '@blog/usecases/delete.post.by.blog.id.use.case';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { CommentQueryRepositoryTypeorm } from '@comment/repository/typeorm/comment.query.repository.typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { dirname, join } from 'node:path';
import { readFile } from 'node:fs';
import { FileS3Adapter } from '@utils/adapters/file.s3.adapter';
import { getFile } from '@utils/fs/get.file';
import sharp from 'sharp';
import { UploadWallpaperImageCommand } from '@blog/usecases/upload.wallpaper.image.use.case';
import { UploadMainImageBlogCommand } from '@blog/usecases/upload.main.image.blog.command.use.case';
import { UploadMainImagePostCommand } from '@blog/usecases/upload.main.image.post.use.case';
// TODO: исправить путь, посмотреть в документации
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private commandBus: CommandBus,
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private commentQueryRepository: CommentQueryRepositoryTypeorm,
    private fileS3Adapter: FileS3Adapter
  ) { }
  // TODO: исправить все гарды на jwtrefreshguard
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(
    @Body() blog: BlogCreateType,
    @Req() req
  ) {
    const userId = req.user

    const blogId: string = await this.commandBus.execute(
      new CreateBlogCommand(blog, userId),
    );

    return this.blogQueryRepository.findBlogViewById(blogId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() inputData: PostCreateByIdType,
    @Res() res: Response,
    @Req() req
  ) {
    const userId = req.user

    const postId = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(inputData, id, userId),
    );
    if (!postId) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const post = await this.postQueryRepository.findPostByIdForPublic(postId);

    return res.status(STATUS_CODE.CREATED).send(post);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getBlogs(
    @Query() queryParam: BlogQueryParamModel,
    @Req() req
  ) {
    const userId = req.user

    return this.blogQueryRepository.findAllBlogsUserView(queryParam, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/posts')
  async getPostByBlogId(
    @Param('id') id: string,
    @Res() res: Response,
    @Query() queryParam: PostQueryParamType,
    @Request() req,
  ) {
    const userId = req.user;

    const blog = await this.blogQueryRepository.findBlogViewById(id);
    if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const posts = await this.postQueryRepository.findPostByBlogForBlogger(
      id,
      queryParam,
      userId,
    );

    return res.status(STATUS_CODE.OK).send(posts);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateData: BlogUpdateType,
    @Res() res: Response,
    @Req() req
  ) {
    const userId = req.user

    const isUpdate = await this.commandBus.execute(
      new UpdateBlogCommand(updateData, id, userId),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:blogId/posts/:postId')
  async updatePostById(
    @Param() param,
    @Body() inputData: PostUpdateByIdModel,
    @Res() res: Response,
    @Req() req
  ) {
    const blogId = param.blogId;
    const postId = param.postId;
    const userId = req.user

    const isUpdate = await this.commandBus.execute(
      new UpdatePostByBlogIdCommand(postId, blogId, inputData, userId),
    );

    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteBlog(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req
  ) {
    const userId = req.user

    const isDelete = await this.commandBus.execute(new DeleteBlogCommand(id, userId));
    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':blogId/posts/:postId')
  async deletePostByBlogId(
    @Param() param,
    @Res() res: Response,
    @Req() req
  ) {
    const postId = param.postId;
    const blogId = param.blogId;
    const userId = req.user

    const isDelete = await this.commandBus.execute(
      new DeletePostByBlogIdCommand(postId, blogId, userId),
    );

    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Get('comments')
  async getAllCommentsPosts(
    @Request() req,
    @Query() queryParam: CommentQueryParam,
  ) {
    const userId = req.user;
    return this.commentQueryRepository.findAllCommentsBlog(userId, queryParam);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blogId/images/wallpaper')
  @UseInterceptors(FileInterceptor('file'))
  async uploadWallpaperForBlog(
    @UploadedFile() file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Res() res: Response,
    @Req() req
  ) {
    const userId = req.user
    const id = await this.commandBus.execute(new UploadWallpaperImageCommand(blogId, userId, file))
    if (!id) return res.sendStatus(HttpStatus.BAD_REQUEST)

    const blogImage = await this.blogQueryRepository.findBlogImagesByBlogId(id)
    return res.status(HttpStatus.CREATED).send(blogImage)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blogId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainImageForBlog(
    @UploadedFile() file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Res() res: Response,
    @Req() req
  ) {
    const userId = req.user
    const id = await this.commandBus.execute(new UploadMainImageBlogCommand(blogId, userId, file))
    if (!id) return res.sendStatus(HttpStatus.BAD_REQUEST)

    const blogImage = await this.blogQueryRepository.findBlogImagesByBlogId(id)

    return res.status(HttpStatus.CREATED).send(blogImage)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blogId/posts/:postId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainImageForPost(
    @UploadedFile() file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Res() res: Response,
    @Req() req
  ) {
    const userId = req.user
    const id = await this.commandBus.execute(new UploadMainImagePostCommand(blogId, postId, userId, file))
    if (!id) return res.sendStatus(HttpStatus.BAD_REQUEST)

    const blogImage = await this.postQueryRepository.findPostImageByBlogId(id)

    return res.status(HttpStatus.CREATED).send(blogImage)
  }
}


