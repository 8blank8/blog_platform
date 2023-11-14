import { Controller, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { CommentRepository } from '../comment/infrastructure/mongo/comment.repository';
import { STATUS_CODE } from '../../utils/enum/status.code';
import { UserRepositorySql } from '../user/infrastructure/sql/user.repository.sql';
import { BlogRepositorySql } from '../blog/infrastructure/sql/blog.repository.sql';
import { PostRepositorySql } from '../post/infrastructure/sql/post.repository.sql';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('/testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSourse: DataSource) {}

  @Delete('/all-data')
  async deleteAllData(@Res() res: Response) {
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
        `);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }
}
