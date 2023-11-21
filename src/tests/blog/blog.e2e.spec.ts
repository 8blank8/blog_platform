import { HttpStatus, INestApplication } from "@nestjs/common"
import { dropDataBase, startTestConfig } from "../utils/start.test.config"
import { Auth } from "../auth/auth"
import { Blog } from "./blog"
import request from 'supertest'


describe('blogger api', () => {
  let app: INestApplication
  const user1 = new Auth()
  const blog1 = new Blog()
  const blog2 = new Blog()

  beforeAll(async () => {
    app = await startTestConfig()
  })

  describe('delete all data', () => {
    it('delete all data', async () => {
      await dropDataBase(app)
    })
  })

  describe('create blogger', () => {
    it('create user1 should be status 201', async () => {
      await user1.registrationUser(app, 1)
    })

    it('login user1 should be status 200', async () => {
      await user1.loginUser(app)
    })
  })

  describe('create blog', () => {
    it('create blog should be status 201', async () => {
      await blog1.createBlog_201(
        app,
        {
          name: "blog1",
          description: "this is a good description",
          websiteUrl: "https://website.com"
        },
        user1.accessToken
      )
    })
  })

  describe('update blog', () => {
    it('update blog should be status 204', async () => {
      await blog1.updateBlog_204(
        app,
        {
          name: "blog2",
          description: "this is a good",
          websiteUrl: "https://website1.com"
        },
        user1.accessToken
      )
    })
  })

  describe('get blogs', () => {
    it('get blog should be status 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .set('Authorization', `Bearer ${user1.accessToken}`)

      expect(res.status).toBe(HttpStatus.OK)

      const data = res.body

      expect(data.totalCount).toBe(1)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(10)
      expect(data.pagesCount).toBe(1)

      expect(data.items.length).toBe(1)
      expect(data.items).toContainEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean)
      })
    })
  })

  describe('delete blog', () => {
    it('delete blog should be status 204', async () => {
      await blog1.deleteBlog_204(app, user1.accessToken)
    })
  })

  describe('get blog after delete', () => {
    it('get blog should be status 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .set('Authorization', `Bearer ${user1.accessToken}`)

      expect(res.status).toBe(HttpStatus.OK)

      const data = res.body

      expect(data.totalCount).toBe(0)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(10)
      expect(data.pagesCount).toBe(0)

      expect(data.items.length).toBe(0)
      expect(data.items).toEqual([])
    })
  })

  describe('create blog and post by blogId', () => {

    it('create blog should be status 201', async () => {
      await blog2.createBlog_201(
        app,
        {
          name: "blog2",
          description: "is description blog2",
          websiteUrl: "https://website2.ru"
        },
        user1.accessToken
      )
    })

    it('create post by id blog should be status 201', async () => {
      await blog2.createPostByBlogId_201(
        app,
        {
          title: "post_user1",
          shortDescription: "short_description is good",
          content: "this content is good content"
        },
        user1.accessToken
      )
    })
  })

  describe('get posts by blog id', () => {
    it('get posts by blog id should be status 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogger/blogs/${blog2.id}/posts`)
        .set('Authorization', `Bearer ${user1.accessToken}`)

      expect(res.status).toBe(HttpStatus.OK)

      const data = res.body
      expect(data.totalCount).toBe(1)
      expect(data.pagesCount).toBe(1)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(10)

      expect(data.items[0]).toEqual(blog2.posts[0])
    })
  })

  describe('update post by blog id', () => {
    it('update post by blog id should be status 204', async () => {
      await blog2.updatePostByBlogId_204(
        app,
        blog2.posts[0].id,
        {
          title: "title_post12",
          shortDescription: "is short desc",
          content: "this is content"
        },
        user1.accessToken
      )
    })
  })

  describe('delete post by blog id', () => {
    it('delete post by blog id should be status 204', async () => {
      await blog2.deletePostByBlogId_204(app, blog2.posts[0].id, user1.accessToken)
    })

    it('get posts by blog id should be status 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogger/blogs/${blog2.id}/posts`)
        .set('Authorization', `Bearer ${user1.accessToken}`)

      expect(res.status).toBe(HttpStatus.OK)

      const data = res.body
      expect(data.totalCount).toBe(0)
      expect(data.pagesCount).toBe(0)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(10)

      expect(data.items).toEqual([])
    })
  })
  // TODO: сделать delete метод для поста по blogId

  afterAll(async () => {
    await app.close()
  })
})