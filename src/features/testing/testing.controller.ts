import { Controller, Delete, Res } from "@nestjs/common";
import { Response } from "express";
import { BlogRepository } from "../blog/infrastructure/mongo/blog.repository";
import { PostRepository } from "../post/infrastructure/mongo/post.repository";
import { UserRepository } from "../user/infrastructure/mongo/user.repository";
import { CommentRepository } from "../comment/infrastructure/mongo/comment.repository";
import { STATUS_CODE } from "../../entity/enum/status.code";
import { UserRepositorySql } from "../user/infrastructure/sql/user.repository.sql";
import { BlogRepositorySql } from "../blog/infrastructure/sql/blog.repository.sql";
import { PostRepositorySql } from "../post/infrastructure/sql/post.repository.sql";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";


@Controller('/testing')
export class TestingController {
    constructor(
        // private readonly blogRepository: BlogRepository,
        private blogRepositorySql: BlogRepositorySql,
        // private readonly postRepository: PostRepository,
        private postRepositorySql: PostRepositorySql,
        // private readonly userRepository: UserRepository,
        private readonly commentsRepository: CommentRepository,
        private userRepositorySql: UserRepositorySql,
        @InjectDataSource() private dataSourse: DataSource
    ) { }

    @Delete('/all-data')
    async deleteAllData(
        @Res() res: Response,

    ) {
        // await this.postRepository.deleteAllData()
        // await this.blogRepository.deleteAllData()
        // await this.userRepository.deleteAllData()
        // await this.commentsRepository.deleteAllComments()
        // await this.commentsRepository.deleteAllCommentsLike()
        // await this.postRepository.deleteAllLikes()
        await this.dataSourse.query(`
        CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
        DECLARE
            statements CURSOR FOR
                SELECT tablename FROM pg_tables
                WHERE tableowner = username AND schemaname = 'public';
        BEGIN
            FOR stmt IN statements LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
    
        SELECT truncate_tables('blank');
        `)
        // await this.userRepositorySql.deleteAllData()
        // await this.blogRepositorySql.deleteAllBlogs()
        // await this.postRepositorySql.deleteAllPosts()

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }
}