import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class IdParamModel {
    @IsUUID()
    id: string
}