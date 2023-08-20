import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

@Schema()
class BanInfo {

}

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
    passwordSalt: string

    @Prop({
        required: true
    })
    createdAt: string

    @Prop({
        required: true
    })
    confirmationCode: string

    @Prop({
        default: false
    })
    isConfirmed: boolean

    @Prop({
        default: false
    })
    isBanned: boolean

    @Prop({
        default: null
    })
    banDate: string

    @Prop({
        default: null
    })
    banReason: string

    addConfirmationCode(code: string) {
        this.confirmationCode = code
    }

    confirmationEmail() {
        this.isConfirmed = true
    }

    addCreatedAt() {
        this.createdAt = new Date().toISOString()
    }

    addId() {
        this.id = uuidv4()
    }

    bannedUser(isBanned: boolean, text: string) {
        this.banDate = new Date().toISOString()
        this.isBanned = isBanned
        this.banReason = text
    }


    async createPasswordHash(password: string): Promise<{ hash: string, salt: string }> {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        return { hash, salt }
    }

    async setPassWordHash(password: string) {
        const hash = await this.createPasswordHash(password)
        this.passwordHash = hash.hash
        this.passwordSalt = hash.salt
    }

    async validatePassword(password: string): Promise<boolean> {
        const newPasswordHash: string = await bcrypt.hash(password, this.passwordSalt)
        if (this.passwordHash !== newPasswordHash) return false

        return true
    }
}

export const UserSchema = SchemaFactory.createForClass(User)


UserSchema.methods = {
    addCreatedAt: User.prototype.addCreatedAt,
    addId: User.prototype.addId,
    createPasswordHash: User.prototype.createPasswordHash,
    setPassWordHash: User.prototype.setPassWordHash,
    validatePassword: User.prototype.validatePassword,
    confirmationEmail: User.prototype.confirmationEmail,
    addConfirmationCode: User.prototype.addConfirmationCode,
    bannedUser: User.prototype.bannedUser
}

export type UserDocument = HydratedDocument<User>