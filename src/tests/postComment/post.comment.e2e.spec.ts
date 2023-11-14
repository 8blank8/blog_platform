import { INestApplication } from '@nestjs/common';
import { dropDataBase, startTestConfig } from '../utils/start.test.config';
import request from 'supertest';
import { createUserDto } from '../utils/create.user.dto';
import { AUTH } from '../enums/base.auth.enum';
import { createBlogDto } from '../utils/create.blog.dto';
import { createPostDto } from '../utils/create.post.dto';
import { v4 as uuidv4 } from 'uuid';

describe('post comment', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await startTestConfig();
    await dropDataBase(app);
  });

  describe('create comment', () => {
    const userDto1 = createUserDto(1);
    let userAccessToken: string;

    const blogDto1 = createBlogDto(1);
    let createdBlog;

    const postDto1 = createPostDto(1);
    let createdPost;

    it('create user', async () => {
      await request(app.getHttpServer())
        .post(`/sa/users`)
        .set('Authorization', AUTH.BASIC)
        .send(userDto1)
        .expect(201);
    });

    it('login user', async () => {
      await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({ loginOrEmail: userDto1.login, password: userDto1.password })
        .expect(200)
        .then(({ body }) => {
          userAccessToken = body.accessToken;
        });
    });

    it('create blog', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs`)
        .set('Authorization', AUTH.BASIC)
        .send(blogDto1)
        .expect(201)
        .then(({ body }) => {
          createdBlog = body;
        });
    });

    it('create post', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', AUTH.BASIC)
        .send(postDto1)
        .expect(201)
        .then(({ body }) => {
          createdPost = body;
        });
    });

    it('create comment invalid content', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${createdPost.id}/comments`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ content: '' })
        .expect(400);
    });

    it('create comment unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${createdPost.id}/comments`)
        .send({ content: 'asdkajsldjalsdsjadjsklajd' })
        .expect(401);
    });

    it('create comment post not found', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${uuidv4()}/comments`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ content: 'asdasdakshdjkahsdjkha' })
        .expect(404);
    });

    it('create comment ok', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${createdPost.id}/comments`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ content: 'asdasdakshdjkahsdjkha' })
        .expect(201);
    });
  });

  describe('get comments', () => {
    const userDto2 = createUserDto(2);
    let userAccessToken;

    const blogDto2 = createBlogDto(2);
    let createdBlog;

    const postDto2 = createPostDto(2);
    let createdPost;

    it('create user', async () => {
      await request(app.getHttpServer())
        .post(`/sa/users`)
        .set('Authorization', AUTH.BASIC)
        .send(userDto2)
        .expect(201);
    });

    it('login user', async () => {
      await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({ loginOrEmail: userDto2.login, password: userDto2.password })
        .expect(200)
        .then(({ body }) => {
          userAccessToken = body.accessToken;
        });
    });

    it('create blog', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs`)
        .set('Authorization', AUTH.BASIC)
        .send(blogDto2)
        .expect(201)
        .then(({ body }) => {
          createdBlog = body;
        });
    });

    it('create post', async () => {
      await request(app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', AUTH.BASIC)
        .send(postDto2)
        .expect(201)
        .then(({ body }) => {
          createdPost = body;
        });
    });

    it('create comment 1', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${createdPost.id}/comments`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ content: 'asdasdakshdjkahsdjkha' })
        .expect(201);
    });

    it('create comment 2', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${createdPost.id}/comments`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ content: 'asdasdakshdjkahsdjkha' })
        .expect(201);
    });
  });
});
