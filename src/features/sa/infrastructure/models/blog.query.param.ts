export class BlogQueryParamModel {
    searchNameTerm: string | undefined
    sortBy: string | undefined
    sortDirection: 'asc' | 'desc' | undefined
    pageNumber: number | undefined
    pageSize: number | undefined
}