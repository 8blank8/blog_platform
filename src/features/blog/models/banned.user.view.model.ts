export class BannedUserViewModel {
    id: string
    login: string
    banInfo: {
        isBanned: boolean
        banDate: string | null
        banReason: string | null
    }
}