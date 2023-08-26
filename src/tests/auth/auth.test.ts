import { Test, TestingModule } from '@nestjs/testing';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { AuthService } from "src/features/auth/application/auth.service";
import { CreateUserCommand, CreateUserUseCase } from "../../features/user/application/useCases/create.user.use.case";
import { UserQueryRepository } from "../../features/user/infrastructure/user.query.repository";
import { UserRepository } from '../../features/user/infrastructure/user.repository';
import { UserCreateType } from "../../features/user/models/user.create.type";
import { User, UserSchema } from '../../features/user/domain/user.schema';
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseModule } from '@nestjs/mongoose';


describe('auth testing', () => {
    let commandBus: CommandBus
    let userQueryRepository: UserQueryRepository

    beforeEach(async () => {

        const mongoServer = await MongoMemoryServer.create()
        const mongoUrl = mongoServer.getUri()

        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUrl),
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema }
                ]),
                CqrsModule
            ],
            providers: [UserQueryRepository, CreateUserUseCase, UserRepository],
        }).compile();

        commandBus = moduleRef.get<CommandBus>(CommandBus);
        userQueryRepository = moduleRef.get<UserQueryRepository>(UserQueryRepository);
    });


    describe('create user', () => {

        it('create user', async () => {
            const createUserDto: UserCreateType = {
                login: "blank32",
                password: "123123",
                email: "test@ya.ru"
            }
            const createdUserId = await commandBus.execute(new CreateUserCommand(createUserDto))

            const user = await userQueryRepository.findUserById(createdUserId)
            console.log(user)
            expect(user).not.toBeNull()
        })
    });
});
