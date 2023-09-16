import { Test } from '@nestjs/testing';
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser'
import { useContainer } from 'class-validator'
import { AppModule } from '../../app.module';
import { HttpExceptionFilter } from '../../exception.filter';
import { EmailManager } from '../../entity/managers/email.manager';

export const startTestConfig = async () => {
    let app: INestApplication;

    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(EmailManager)
        .useValue({
            sendEmailConfirmationMessage: () => {
                console.log('email manages ');
            }
        })
        .compile()

    app = moduleRef.createNestApplication();
    app.use(cookieParser())
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        exceptionFactory: (errors) => {
            const errorMessages = errors.map(({ property, constraints }) => {
                if (constraints) {
                    return {
                        message: constraints[Object.keys(constraints)[0]],
                        field: property
                    }
                }
            })

            throw new BadRequestException(errorMessages)
        },
    }))
    app.useGlobalFilters(new HttpExceptionFilter())
    await app.init();

    dropDataBase(app)

    return app


}


export const dropDataBase = async (app) => {

    const dataSource = await app.resolve(DataSource)
    await dataSource.query(`
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

    SELECT truncate_tables('postgres');
    `)
}
