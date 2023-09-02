export class UserBannedSqlModel {
    id: string
    userId: string
    banDate: string | null
    banReason: string | null
    isBanned: boolean
}