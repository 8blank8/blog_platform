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

import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserRepository } from './user/user.repository';
import { UserQueryRepository } from './user/user.query.repository';

import { TestingController } from './testing/testing.controller';
import { User, UserSchema } from './user/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://blank:admin@cluster0.zmondyt.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [AppController, BlogController, PostControler, UserController, TestingController],
  providers: [
    AppService,
    BlogRepository, BlogService, BlogQueryRepository,
    PostQueryRepository, PostService, PostRepository,
    UserService, UserRepository, UserQueryRepository,
  ],
})
export class AppModule { }
