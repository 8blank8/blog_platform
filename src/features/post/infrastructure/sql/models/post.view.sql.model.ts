export class PostViewSqlModel {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: {
        likesCount: number
        dislikesCount: number
        myStatus: string
        newestLikes: NewestLike[]
    }
}

class NewestLike {
    addedAt: string
    userId: string
    login: string
}