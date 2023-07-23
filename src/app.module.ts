import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './blog/blog.schema';
import { BlogRepository } from './blog/blog.repository';
import { BlogController } from './blog/blog.controller';
import { BlogService } from './blog/blog.service';
import { BlogQueryRepository } from './blog/blog.query.repository';

import { Post, PostSchema } from './post/post.schema';
import { PostQueryRepository } from './post/post.query.repository';
import { PostControler } from './post/post.controller';
import { PostService } from './post/post.service';
import { PostRepository } from './post/post.repository';

import { TestingController } from './testing/testing.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://blank:admin@cluster0.zmondyt.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema }
    ]),
  ],
  controllers: [AppController, BlogController, PostControler, TestingController],
  providers: [
    AppService,
    BlogRepository, BlogService, BlogQueryRepository,
    PostQueryRepository, PostService, PostRepository],
})
export class AppModule { }
