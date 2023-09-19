import { INestApplication } from "@nestjs/common"
import { startTestConfig } from "../utils/start.test.config"
import request from 'supertest'
import { createUserDto } from "../utils/create.user.dto"
import { AUTH } from "../enums/base.auth.enum"
import { createBlogDto } from "../utils/create.blog.dto"
import { createPostDto } from "../utils/create.post.dto"


describe('post comment', () => {
    let app: INestApplication

    beforeAll(async () => {
        app = await startTestConfig()
    })

    describe('create comment', () => {

        const userDto1 = createUserDto(1)
        let userAccessToken: string

        const blogDto1 = createBlogDto(1)
        let createdBlog

        const postDto1 = createPostDto(1)
        let createdPost

        it('create user', async () => {
            await request(app.getHttpServer())
                .post(`/sa/users`)
                .set('Authorization', AUTH.BASIC)
                .send(userDto1)
                .expect(201)
        })

        it('login user', async () => {
            await request(app.getHttpServer())
                .post(`/auth/login`)
                .send({ loginOrEmail: userDto1.login, password: userDto1.password })
                .expect(200)
                .then(({ body }) => {
                    userAccessToken = body.accessToken
                })
        })

        it('create blog', async () => {
            await request(app.getHttpServer())
                .post(`sa/blogs2`)
                .set('Authorization', AUTH.BASIC)
                .send(blogDto1)
                .expect(201)
                .then(({ body }) => {
                    createdBlog = body
                })
        })

        it('create post', async () => {
            await request(app.getHttpServer())
                .post(`/sa/blogs/${createdBlog.id}/posts`)
                .set('Authorization', AUTH.BASIC)
                .send(postDto1)
                .expect(201)
                .then(({ body }) => {
                    createdPost = body
                })
        })

        it('create comment invalid content', async () => {
            await request(app.getHttpServer())
                .post(`/posts/${createdPost.id}/comments`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ content: '' })
                .expect(400)
        })

        // await request(app.getHttpServer())
        //         .post(``)

    })

})