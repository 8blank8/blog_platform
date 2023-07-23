import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

@Schema()
export class User {
    @Prop({
        required: true
    })
    id: string

    @Prop({
        required: true
    })
    login: string

    @Prop({
        required: true
    })
    email: string

    @Prop({
        required: true
    })
    passwordHash: string

    @Prop({
        required: true
    })
    createdAt: string

    addCreatedAt() {
        this.createdAt = new Date().toISOString()
    }

    addId() {
        this.id = uuidv4()
    }

    async createPasswordHash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        return hash
    }

    async setPassWordHash(password: string) {
        this.passwordHash = await this.createPasswordHash(password)
    }
}

export const UserSchema = SchemaFactory.createForClass(User)


UserSchema.methods = {
    addCreatedAt: User.prototype.addCreatedAt,
    addId: User.prototype.addId,
    createPasswordHash: User.prototype.createPasswordHash,
    setPassWordHash: User.prototype.setPassWordHash,
}

export type UserDocument = HydratedDocument<User>