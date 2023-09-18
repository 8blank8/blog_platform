export class BlogQueryParamModel {
    searchNameTerm: string | undefined
    sortBy: string | undefined
    sortDirection: 'asc' | 'desc' | undefined
    pageNumber: string | undefined
    pageSize: string | undefined
}