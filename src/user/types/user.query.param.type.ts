export type UserQueryParamType = {
    sortBy: string | undefined
    sortDirection: 'asc' | 'desc' | undefined
    pageNumber: number | undefined
    pageSize: number | undefined
    searchLoginTerm: string | undefined
    searchEmailTerm: string | undefined
}