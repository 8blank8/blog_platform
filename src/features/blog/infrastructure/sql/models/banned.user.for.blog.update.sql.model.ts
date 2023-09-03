export class BannedUserForBlogUpdateSqlModel {
    userId: string
    blogId: string
    isBanned: boolean
    banReason: string | null
}