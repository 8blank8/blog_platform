import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './blog/blog.schema';
import { BlogRepository } from './blog/blog.repository';
import { BlogController } from './blog/blog.controller';
import { BlogService } from './blog/blog.service';
import { BlogQueryRepository } from './blog/blog.query.repository';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://blank:admin@cluster0.zmondyt.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])
  ],
  controllers: [AppController, BlogController],
  providers: [AppService, BlogRepository, BlogService, BlogQueryRepository],
})
export class AppModule { }
