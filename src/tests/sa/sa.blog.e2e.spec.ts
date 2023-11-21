import { HttpStatus, INestApplication } from "@nestjs/common"
import { dropDataBase, startTestConfig } from "../utils/start.test.config"
import { Auth } from "../auth/auth"
import { Blog } from "../blog/blog"
import request from 'supertest'
import { Sa } from "./sa"
import { AUTH } from "../enums/base.auth.enum"


describe('sa/blog', () => {
    let app: INestApplication

    const user1 = new Auth()
    const user2 = new Auth()
    const blog1 = new Blog()
    const blog2 = new Blog()
    const blog3 = new Blog()
    const sa = new Sa()

    const user3 = new Auth()
    const user4 = new Auth()
    const blog4 = new Blog()
    const blog5 = new Blog()

    let postIdUser3: string
    let postIdUser4: string

    beforeAll(async () => {
        app = await startTestConfig()
    })

    describe('delete all data', () => {
        it('delete all data', async () => {
            await dropDataBase(app)
        })
    })

    describe('bind blog other user', () => {
        it('create user should be status 201', async () => {
            await user1.registrationUser(app, 4)
        })

        it('login user should be status 200', async () => {
            await user1.loginUser(app)
        })

        it('create blog by user1 should be status 201', async () => {
            await blog1.createBlog_201(
                app,
                {
                    name: "blog1",
                    description: "is blog for user1",
                    websiteUrl: "https://website.com"
                },
                user1.accessToken
            )
        })

        it('get blogs by user1 should be status 200 items length 1', async () => {
            const res = await request(app.getHttpServer())
                .get('/blogger/blogs')
                .set('Authorization', `Bearer ${user1.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)
            expect(res.body.items.length).toBe(1)
        })

        it('create user2 should be status 201', async () => {
            await user2.registrationUser(app, 2)
        })

        it('login user2 should be status 200', async () => {
            await user2.loginUser(app)
        })

        it('get blogs by user2 should be status 200 items length 0', async () => {
            const res = await request(app.getHttpServer())
                .get('/blogger/blogs')
                .set('Authorization', `Bearer ${user2.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)
            expect(res.body.items.length).toBe(0)
        })

        it('bind blog1 for user2 should be status 204', async () => {
            await sa.bindBlogOtherUser_204(app, user2.id, blog1.id)
        })

        it('get blogs by user2 should be status 200 items length 1', async () => {
            const res = await request(app.getHttpServer())
                .get('/blogger/blogs')
                .set('Authorization', `Bearer ${user2.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.items.length).toBe(1)
        })

        it('get blogs by user1 should be status 200 items length 0', async () => {
            const res = await request(app.getHttpServer())
                .get('/blogger/blogs')
                .set('Authorization', `Bearer ${user1.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.items.length).toBe(0)
        })
    })

    describe('create two blogs for user1', () => {
        it('create blog2 for user1 should be status 201', async () => {
            await blog2.createBlog_201(
                app,
                {
                    name: "blog2",
                    description: "is blog for user1",
                    websiteUrl: "https://website.com"
                },
                user1.accessToken
            )
        })

        it('create blog3 for user1 should be status 201', async () => {
            await blog3.createBlog_201(
                app,
                {
                    name: "blog2",
                    description: "is blog for user1",
                    websiteUrl: "https://website.com"
                },
                user1.accessToken
            )
        })
    })

    describe('get all blogs for sa', () => {
        it('get all blogs should be status 200 and 3 blogs', async () => {
            const res = await request(app.getHttpServer())
                .get('/sa/blogs')
                .set('Authorization', AUTH.BASIC)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.pagesCount).toBe(1)
            expect(res.body.page).toBe(1)
            expect(res.body.pageSize).toBe(10)
            expect(res.body.totalCount).toBe(3)

            expect(res.body.items).toContainEqual({
                id: expect.any(String),
                name: expect.any(String),
                description: expect.any(String),
                websiteUrl: expect.any(String),
                createdAt: expect.any(String),
                isMembership: expect.any(Boolean),
                blogOwnerInfo: {
                    userId: expect.any(String),
                    userLogin: expect.any(String)
                }
            })
        })
    })

    describe('delete all data', () => {
        it('delete all data', async () => {
            await dropDataBase(app)
        })
    })

    describe('check ban user flow', () => {
        // дропнуть базу

        // зарегать и залогинить 2 пользователей 
        it('registration 2 users should be status 201', async () => {
            await user3.registrationUser(app, 3)
            await user4.registrationUser(app, 4)
        })

        it('login 2 users should be status 200', async () => {
            await user3.loginUser(app)
            await user4.loginUser(app)
        })

        // добавить блоги 2 пользователей
        it('create 2 blog for two users should be status 201', async () => {
            await blog4.createBlog_201(
                app,
                {
                    name: "blog_user3",
                    description: "is blog for user3",
                    websiteUrl: "https://website.com"
                },
                user3.accessToken
            )

            await blog5.createBlog_201(
                app,
                {
                    name: "blog_user4",
                    description: "is blog for user4",
                    websiteUrl: "https://website.com"
                },
                user4.accessToken
            )
        })

        // добавить посты 2 пользователей 
        it('create two posts for users should be status 201', async () => {
            postIdUser3 = await blog4.createPostByBlogId_201(
                app,
                {
                    title: "post_user3",
                    shortDescription: "is post for user3",
                    content: "it is good content"
                },
                user3.accessToken
            )

            postIdUser4 = await blog5.createPostByBlogId_201(
                app,
                {
                    title: "post_user4",
                    shortDescription: "is post for user4",
                    content: "it is good content"
                },
                user4.accessToken
            )
        })

        // сделать комментарий пользователя 1 к посту пользователя 2
        it('create comment user3 for post user4 should be status 201', async () => {
            await blog5.createCommentForPost_201(
                app,
                {
                    content: "this comment by user3"
                },
                postIdUser4,
                {
                    accessToken: user3.accessToken,
                    id: user3.id,
                    login: user3.login
                }
            )
        })

        // поставить лайк пользователем 1 на тот же пост 
        it('add like user3 for post user4 should be status 204', async () => {
            await blog5.updateLikeStatusForPost_204(
                app,
                postIdUser4,
                {
                    likeStatus: 'Like'
                },
                user3.accessToken
            )
        })

        // забанить пользователя
        it('ban user3 should be status 204', async () => {
            await sa.banUser_204(
                app,
                {
                    userId: user3.id,
                    isBanned: true,
                    banReason: "this user is bad asssssssssssssssssssssssss"
                }
            )
        })

        // проверить удаленны ли все девайся пользователя
        it('get devices by user3 should be status 200, devices not found', async () => {
            const res = await request(app.getHttpServer())
                .get(`/security/devices`)
                .set('Cookie', user3.refreshToken)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.length).toBe(0)
        })

        // попытаться залогиниться забаненым пользователем
        it('login user3 after banned should be status 401', async () => {
            await user3.loginUserBanned_401(app)
        })

        // посмотреть список постов не забаненным пользователем, должен быть один пост 
        it('find posts by user4 should be status 200, posts item 1', async () => {
            const res = await request(app.getHttpServer())
                .get(`/posts`)
                .set('Authorization', `Bearer ${user4.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.totalCount).toBe(1)
            expect(res.body.items.length).toBe(1)
        })

        // попытаться найти пост пользователя 3 по id должно вернуть not_found
        it('find post user3 by user4 should be status 404', async () => {
            const res = await request(app.getHttpServer())
                .get(`/posts/${postIdUser3}`)
                .set('Authorization', `Bearer ${user4.accessToken}`)

            expect(res.status).toBe(HttpStatus.NOT_FOUND)
        })

        // проверить что лайк забаненного пользователя не отображается 
        it('find post by user4 should be status 200, post newest like empty', async () => {
            const res = await request(app.getHttpServer())
                .get(`/posts/${postIdUser4}`)
                .set('Authorization', `Bearer ${user4.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.extendedLikesInfo.newestLikes).toEqual([])
            expect(res.body.extendedLikesInfo.likesCount).toBe(0)
        })

        // найти все посты и на них не должно быть лайка забаненного пользователя
        it('find posts by user4 should be status 200, post newest like empty', async () => {
            const res = await request(app.getHttpServer())
                .get(`/posts`)
                .set('Authorization', `Bearer ${user4.accessToken}`)

            expect(res.status).toBe(HttpStatus.OK)

            expect(res.body.items[0].extendedLikesInfo.newestLikes).toEqual([])
            expect(res.body.items[0].extendedLikesInfo.likesCount).toBe(0)
        })
    })


    // Забаненый пользователь не может логиниться
    //     Все девайсы пользователя должны быть удалены
    //     Все посты, комментарии, лайки забаненого пользователя не виды

    afterAll(async () => {
        await app.close()
    })
})