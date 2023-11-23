import { HttpStatus, INestApplication } from "@nestjs/common"
import { dropDataBase, startTestConfig } from "../utils/start.test.config"
import { Auth } from "../auth/auth"
import { Blog } from "./blog"
import request from 'supertest'
import { Sa } from "../sa/sa"
import { AUTH } from "../enums/base.auth.enum"


describe('blogger api', () => {
  let app: INestApplication
  const user1 = new Auth()
  const blog1 = new Blog()
  const blog2 = new Blog()

  const user2 = new Auth()
  const user3 = new Auth()
  const blog3 = new Blog()
  let postIdUser3: string

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

  describe('delete all data', () => {
    it('delete all data', async () => {
      await dropDataBase(app)
    })
  })

  describe('check banned user for blog flow', () => {

    // создать 2  пользователей и залогинить
    it('create user2, user3 should be status 201', async () => {
      await user2.registrationUser(app, 2)
      await user3.registrationUser(app, 3)
    })

    it('login user2, user3 should be status 200', async () => {
      await user2.loginUser(app)
      await user3.loginUser(app)
    })

    // создать блог для пользователя 1
    it('create blog for user3 should be status 201', async () => {
      await blog3.createBlog_201(
        app,
        {
          name: "blog_user3",
          description: "is description for blog3",
          websiteUrl: "https://website.com"
        },
        user3.accessToken
      )
    })

    // создать пост для блога
    it('create post for blog3 should be status 201', async () => {
      postIdUser3 = await blog3.createPostByBlogId_201(
        app,
        {
          title: "title_blog3",
          shortDescription: "short description for post blog3",
          content: "this content is good"
        },
        user3.accessToken
      )
    })

    // оставить комментарий к блогу пользователя 1
    it('create comment by user2 for post user3 should be status 201', async () => {
      await blog3.createCommentForPost_201(
        app,
        {
          content: "content by user2 for blog3"
        },
        postIdUser3,
        {
          accessToken: user2.accessToken,
          id: user2.id,
          login: user2.login
        }
      )
    })

    // забанить пользователя 2
    it('ban user3 for blog3 should be status 204', async () => {
      await blog3.banUserForBlog(
        app,
        user2.id,
        {
          isBanned: true,
          banReason: "is user so bad assssssssssss",
          blogId: blog3.id
        },
        user3.accessToken
      )
    })

    // попробовать оставить комментарий к блогу пользователя 1
    it('create comment by user2 for blog3, after banned should be status 400', async () => {
      await blog3.createCommentForPostUserIsBanned_403(
        app,
        {
          content: "content for post blog3"
        },
        postIdUser3,
        {
          accessToken: user2.accessToken,
          id: user2.id,
          login: user2.login
        }
      )
    })

    it('find banned users for blog3 should be status 200, items length 1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog3.id}`)
        .set('Authorization', `Bearer ${user3.accessToken}`)

      expect(res.status).toBe(HttpStatus.OK)

      expect(res.body.totalCount).toBe(1)
      expect(res.body.items[0]).toEqual({
        id: user2.id,
        login: user2.login,
        banInfo: {
          isBanned: true,
          banDate: expect.any(String),
          banReason: expect.any(String)
        }
      })
    })
  })

  describe('delete all data', () => {
    it('delete all data', async () => {
      await dropDataBase(app)
    })
  })

  describe('check ban blog flow', () => {
    const user1 = new Auth()
    const blog1 = new Blog()
    const blog2 = new Blog()
    const sa = new Sa()

    // создать пользователя1 
    it('create user1 should be status 201', async () => {
      await user1.registrationUser(app, 1)
    })

    // залогинить пользователя1
    it('login user1 should be status 200', async () => {
      await user1.loginUser(app)
    })

    // создать два блога от пользователя1
    it('create blog1, blog2, by user1 should be status 201', async () => {
      await blog1.createBlog_201(
        app,
        {
          name: "blog1_user1",
          description: "is blog by user1",
          websiteUrl: "https://website.url"
        },
        user1.accessToken
      )

      await blog2.createBlog_201(
        app,
        {
          name: "blog2_user1",
          description: "is blog by user1",
          websiteUrl: "https://website.url"
        },
        user1.accessToken
      )
    })

    // запросить блоги должно отображаться 2 блога
    it('get all blog should be status 200, totalCount 2', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogs`)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body.totalCount).toBe(2)
    })

    it('get blog1 by id should be status 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}`)

      expect(res.status).toBe(HttpStatus.OK)
    })

    // забанить 1 блог 
    it('ban blog1 by sa should be status 204', async () => {
      await sa.banBlog_204(app, blog1.id, true)
    })

    // запросить блоги должно отображаться 1 блог
    it('get all blog should be status 200, totalCount 1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogs`)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body.totalCount).toBe(1)
    })

    it('get blog1 by id after ban blog should be status 404', async () => {
      const res = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}`)

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('get all blogs by sa should be status 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .set('Authorization', AUTH.BASIC)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body.totalCount).toBe(2)

    })
  })

  describe('delete all data', () => {
    it('delete all data', async () => {
      await dropDataBase(app)
    })
  })

  describe('find all comments for all posts', () => {
    const user1 = new Auth()
    const user2 = new Auth()
    const blog1 = new Blog()
    const blog2 = new Blog()

    let postId_1: string
    let postId_2: string
    let postId_3: string
    let postIdBlog2: string

    it('create user1 and user2 should be status 201', async () => {
      await user1.registrationUser(app, 1)
      await user2.registrationUser(app, 2)
    })

    it('login user1 and user2 should be status 200', async () => {
      await user1.loginUser(app)
      await user2.loginUser(app)
    })

    it('create blog1 by user1 should be status 201', async () => {
      await blog1.createBlog_201(
        app,
        {
          name: "blog1_user1",
          description: "is blog for user1",
          websiteUrl: "https://website.com"
        },
        user1.accessToken
      )
    })

    it('create 3 posts for blog1 should be status 201', async () => {
      postId_1 = await blog1.createPostByBlogId_201(
        app,
        {
          title: "title_post1",
          shortDescription: "lalsdmalmslamsldmalsmdlkam",
          content: "it is content"
        },
        user1.accessToken
      )

      postId_2 = await blog1.createPostByBlogId_201(
        app,
        {
          title: "title_post2",
          shortDescription: "lalsdmalmslamsldmalsmdlkam",
          content: "it is content"
        },
        user1.accessToken
      )

      postId_3 = await blog1.createPostByBlogId_201(
        app,
        {
          title: "title_post3",
          shortDescription: "lalsdmalmslamsldmalsmdlkam",
          content: "it is content"
        },
        user1.accessToken
      )
    })

    it('create blog1 by user1 should be status 201', async () => {
      await blog2.createBlog_201(
        app,
        {
          name: "blog1_user2",
          description: "is blog for user2",
          websiteUrl: "https://website.com"
        },
        user2.accessToken
      )
    })

    it('create post for blog2 by user2 should be status 201', async () => {
      postIdBlog2 = await blog2.createPostByBlogId_201(
        app,
        {
          title: "title_post1",
          shortDescription: "lalsdmalmslamsldmalsmdlkam",
          content: "it is content"
        },
        user2.accessToken
      )
    })

    it('create comment for post blog2 by user1 should be status 201', async () => {
      await blog2.createCommentForPost_201(
        app,
        {
          content: "content by user1 ssssssssssssssssssssssss"
        },
        postIdBlog2,
        {
          accessToken: user1.accessToken,
          id: user1.id,
          login: user1.login
        }
      )
    })

    it('create 2 comments by user1 and user2 for 3 posts should be status 201', async () => {
      await blog1.createCommentForPost_201(
        app,
        {
          content: "content by user1 ssssssssssssssssssssssss"
        },
        postId_1,
        {
          accessToken: user1.accessToken,
          id: user1.id,
          login: user1.login
        }
      )

      await blog1.createCommentForPost_201(
        app,
        {
          content: "content by user2 ssssssssssssssssssssssss"
        },
        postId_1,
        {
          accessToken: user2.accessToken,
          id: user2.id,
          login: user2.login
        }
      )

      await blog1.createCommentForPost_201(
        app,
        {
          content: "content by user1 ssssssssssssssssssssssss"
        },
        postId_2,
        {
          accessToken: user1.accessToken,
          id: user1.id,
          login: user1.login
        }
      )

      await blog1.createCommentForPost_201(
        app,
        {
          content: "content by user2  ssssssssssssssssssssssss"
        },
        postId_2,
        {
          accessToken: user2.accessToken,
          id: user2.id,
          login: user2.login
        }
      )

      await blog1.createCommentForPost_201(
        app,
        {
          content: "content by user1 ssssssssssssssssssssssss"
        },
        postId_3,
        {
          accessToken: user1.accessToken,
          id: user1.id,
          login: user1.login
        }
      )

      await blog1.createCommentForPost_201(
        app,
        {
          content: "content by user2 ssssssssssssssssssssssss"
        },
        postId_3,
        {
          accessToken: user2.accessToken,
          id: user2.id,
          login: user2.login
        }
      )
    })

    it('get all comments for all posts, should be status 200, totalCount 6', async () => {
      const res = await request(app.getHttpServer())
        .get('/blogger/blogs/comments')
        .set('Authorization', `Bearer ${user1.accessToken}`)

      expect(res.status).toBe(HttpStatus.OK)
      expect(res.body.totalCount).toBe(6)
    })
  })

  afterAll(async () => {
    await app.close()
  })
})