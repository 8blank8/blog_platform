import { INestApplication } from '@nestjs/common';
import { dropDataBase, startTestConfig } from '../utils/start.test.config';
import request from 'supertest';
import { AUTH } from '../enums/base.auth.enum';
import { createBlogDto } from '../utils/create.blog.dto';
import { createPostDto } from '../utils/create.post.dto';

describe('post', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await startTestConfig();
  });

  describe('delete all data', () => {
    it('delete all data', async () => {
      await request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(204);
    });
  });

  describe('create post', () => {
    const blogDto = createBlogDto(1);
    const postDto = createPostDto(1);

    let createdBlog;

    it('create blog', async () => {
      await request(app.getHttpServer())
        .post('/sa/blogs')
        .set('Authorization', AUTH.BASIC)
        .send(blogDto)
        .expect(201)
        .then(({ body }) => {
          createdBlog = body;
        });
    });

    it('create post invald title', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', AUTH.BASIC)
        .send({ ...postDto, title: '' })
        .expect(400);
    });

    it('create post invald shortDescription', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', AUTH.BASIC)
        .send({ ...postDto, shortDescription: '' })
        .expect(400);
    });

    it('create post invald content', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', AUTH.BASIC)
        .send({ ...postDto, content: '' })
        .expect(400);
    });

    it('create post unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .send({ ...postDto, content: '' })
        .expect(401);
    });

    it('create post ok', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', AUTH.BASIC)
        .send(postDto)
        .expect(201)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            title: postDto.title,
            shortDescription: postDto.shortDescription,
            content: postDto.content,
            blogId: createdBlog.id,
            blogName: createdBlog.name,
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
              newestLikes: [],
            },
          });
        });
    });
  });
});
