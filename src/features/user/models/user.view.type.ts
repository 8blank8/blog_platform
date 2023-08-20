export class UserViewType {
    id: string
    login: string
    email: string
    createdAt: string
    banInfo: BanInfo
}

class BanInfo {
    isBanned: boolean
    banDate: string | null
    banReason: string | null
}