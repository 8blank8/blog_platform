import { QUERY_PARAM_SQL } from "../enum/query.param.enum.sql";


export class DefaultPagination {
    constructor(
        public pageSize: string | undefined,
        public pageNumber: string | undefined,
        public sortBy?: string | undefined,
        public sortDirection?: string | undefined
    ) { }

    getSortDirectionForSql(): { sortDirection: "ASC" | "DESC" } {
        const sortDirection = this.sortDirection === 'asc' ? QUERY_PARAM_SQL.SORT_DIRECTION_ASC : QUERY_PARAM_SQL.SORT_DIRECTION_DESC

        return {
            sortDirection: sortDirection
        }
    }

    getDefaultPagination(): {
        sortBy: string,
        pageSize: number,
        pageNumber: number,
        offset: number
    } {

        const sortBy = this.sortBy ?? QUERY_PARAM_SQL.SORT_BY
        const pageSize = this.pageSize ?? QUERY_PARAM_SQL.PAGE_SIZE
        const pageNumber = this.pageNumber ?? QUERY_PARAM_SQL.PAGE_NUMBER
        const offset = (+pageNumber - 1) * +pageSize

        return {
            sortBy: sortBy,
            pageSize: +pageSize,
            pageNumber: +pageNumber,
            offset: offset
        }
    }
}

