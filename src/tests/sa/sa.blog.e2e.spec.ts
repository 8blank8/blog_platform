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

    afterAll(async () => {
        await app.close()
    })
})