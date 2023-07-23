export type PostViewType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: LikesInfo
}

type LikesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: NewestLike[]
}

type NewestLike = {
    addedAt: string,
    userId: string,
    login: string
}