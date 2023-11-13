import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


@Schema()
export class Auth {
    @Prop({
        required: true
    })
    refreshToken: string
}

export const AuthSchema = SchemaFactory.createForClass(Auth)
export type AuthDocument = HydratedDocument<Auth>

