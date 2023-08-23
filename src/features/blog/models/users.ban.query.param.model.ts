export class UsersBanQueryParamModel {
    searchLoginTerm: string | undefined
    sortBy: string | undefined
    sortDirection: 'asc' | 'desc' | undefined
    pageNumber: number | undefined
    pageSize: number | undefined
}