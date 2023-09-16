import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { dropDataBase, startTestConfig } from "../utils/start.test.config";
import { createBlogDto } from "../utils/create.blog.dto";
import { AUTH } from "../enums/base.auth.enum";
import { v4 as uuidv4 } from 'uuid'
import { BlogCreateSqlModel } from "src/features/blog/infrastructure/sql/models/blog.create.sql.model";
import { BlogViewSqlModel } from "src/features/blog/infrastructure/sql/models/blog.view.sql.model";


describe('blog', () => {
    let app: INestApplication
    const basicAuth: string = 'Basic YWRtaW46cXdlcnR5'

    beforeAll(async () => {
        app = await startTestConfig()
    });

    beforeEach(async () => {
        await dropDataBase(app)
    })

    describe('post blog', () => {

        const blog1 = createBlogDto(1)

        it('created blog unauthorized 401', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .send(blog1)
                .expect(401)
        })

        it('created blog invalid name 400', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send({ ...blog1, name: '' })
                .expect(400)
        })

        it('created blog invalid websiteUrl 400', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send({ ...blog1, websiteUrl: '' })
                .expect(400)
        })

        it('created blog invalid description 400', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send({ ...blog1, description: '' })
                .expect(400)
        })

        it('created blog 201', async () => {
            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send(blog1)
                .expect(201)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: expect.any(String),
                        name: blog1.name,
                        description: blog1.description,
                        websiteUrl: blog1.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: expect.any(Boolean)
                    })
                })
        })

    })

    describe('get blog by id', () => {

        const blog1 = createBlogDto(1)
        let createdBlog1

        it('created blog 201', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send(blog1)
                .expect(201)
                .then(({ body }) => {

                    createdBlog1 = body

                    expect(body).toEqual({
                        id: expect.any(String),
                        name: blog1.name,
                        description: blog1.description,
                        websiteUrl: blog1.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: expect.any(Boolean)
                    })
                })
        })

        it('get blog by id 200', async () => {

            await request(app.getHttpServer())
                .get(`/blogs/${createdBlog1.id}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toEqual({
                        id: createdBlog1.id,
                        name: createdBlog1.name,
                        description: createdBlog1.description,
                        websiteUrl: createdBlog1.websiteUrl,
                        createdAt: createdBlog1.createdAt,
                        isMembership: createdBlog1.isMembership
                    })
                })
        })

        it('get blog by id 404', async () => {
            await request(app.getHttpServer())
                .get(`/blogs/${uuidv4()}`)
                .expect(404)
        })

    })

    describe('put blog', () => {

        const blog1: BlogCreateSqlModel = createBlogDto(1)
        let createdBlog1: BlogViewSqlModel

        const updateBlogDto = {
            name: 'updateName1',
            description: 'updateDescription1',
            websiteUrl: 'https://update-some-site1.ru'
        }

        it('created blog 201', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send(blog1)
                .expect(201)
                .then(({ body }) => {

                    createdBlog1 = body

                    expect(body).toEqual({
                        id: expect.any(String),
                        name: blog1.name,
                        description: blog1.description,
                        websiteUrl: blog1.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: expect.any(Boolean)
                    })
                })
        })

        it('put blog 204', async () => {
            await request(app.getHttpServer())
                .put(`/sa/blogs/${createdBlog1.id}`)
                .set('Authorization', AUTH.BASIC)
                .send(updateBlogDto)
                .expect(204)
        })

        it('put blog unauthorized 401', async () => {
            await request(app.getHttpServer())
                .put(`/sa/blogs/${createdBlog1.id}`)
                .send(updateBlogDto)
                .expect(401)
        })

        it('put blog invalid name 400', async () => {
            await request(app.getHttpServer())
                .put(`/sa/blogs/${createdBlog1.id}`)
                .set('Authorization', AUTH.BASIC)
                .send({ ...updateBlogDto, name: '' })
                .expect(400)
        })

        it('put blog invalid description 400', async () => {
            await request(app.getHttpServer())
                .put(`/sa/blogs/${createdBlog1.id}`)
                .set('Authorization', AUTH.BASIC)
                .send({ ...updateBlogDto, description: '' })
                .expect(400)
        })

        it('put blog invalid websiteUrl 400', async () => {
            await request(app.getHttpServer())
                .put(`/sa/blogs/${createdBlog1.id}`)
                .set('Authorization', AUTH.BASIC)
                .send({ ...updateBlogDto, websiteUrl: '' })
                .expect(400)
        })
    })

    describe('delete blog', () => {

        const blog1: BlogCreateSqlModel = createBlogDto(1)
        let createdBlog1: BlogViewSqlModel

        it('created blog 201', async () => {

            await request(app.getHttpServer())
                .post('/sa/blogs')
                .set('Authorization', AUTH.BASIC)
                .send(blog1)
                .expect(201)
                .then(({ body }) => {

                    createdBlog1 = body

                    expect(body).toEqual({
                        id: expect.any(String),
                        name: blog1.name,
                        description: blog1.description,
                        websiteUrl: blog1.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: expect.any(Boolean)
                    })
                })
        })

        it('delete blog unauthorized 401', async () => {
            await request(app.getHttpServer())
                .delete(`/sa/blogs/${createdBlog1.id}`)
                .expect(401)
        })

        it('delete blog not found 404', async () => {
            await request(app.getHttpServer())
                .delete(`/sa/blogs/${uuidv4()}`)
                .set('Authorization', AUTH.BASIC)
                .expect(404)
        })

        it('delete blog no content 204', async () => {
            await request(app.getHttpServer())
                .delete(`/sa/blogs/${createdBlog1.id}`)
                .set('Authorization', AUTH.BASIC)
                .expect(204)

            await request(app.getHttpServer())
                .get(`/blogs/${createdBlog1.id}`)
                .expect(404)
        })
    })

    afterAll(async () => {
        await app.close()
    })

})