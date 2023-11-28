import { Module } from "@nestjs/common";
import { IntegrationsController } from "./api/integrations.controller";
import { TelegramAdapter } from "@utils/adapters/telegram.adapter";
import { HandlerTelegramUseCase } from "./useCases/handler.telegram.use.case";
import { CreateTelegramAuthCodeUseCase } from "./useCases/create.telegram.auth.code";
import { CreateTelegramProfileUseCase } from "./useCases/create.telegram.profile.use.case";
import { UserModule } from "@user/user.module";


@Module({
    imports: [UserModule],
    controllers: [IntegrationsController],
    providers: [
        TelegramAdapter,
        HandlerTelegramUseCase,
        CreateTelegramAuthCodeUseCase,
        CreateTelegramProfileUseCase
    ]
})
export class IntegrationModule { }