import { IsBoolean, IsNotEmpty } from "class-validator";


export class UpdatePublishedQuestModel {
    @IsNotEmpty()
    @IsBoolean()
    published: boolean
}