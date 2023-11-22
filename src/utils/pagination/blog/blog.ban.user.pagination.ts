import { DefaultPagination } from '../default.pagination';
import { QUERY_PARAM_SQL } from '../../../utils/enum/query.param.enum.sql';
import { UsersBanQueryParamModel } from '@blog/models/users.ban.query.param.model';

export class BlogBanUserPagination extends DefaultPagination {
    constructor(private queryParam: UsersBanQueryParamModel) {
        super(
            queryParam.pageSize,
            queryParam.pageNumber,
            queryParam.sortBy,
            queryParam.sortDirection,
        );
    }

    getBlogBanUserPaginationForSql() {
        const defaultPagination = this.getDefaultPagination();
        const sortDirection = this.getSortDirectionForSql();

        const { searchLoginTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM } =
            this.queryParam;

        return {
            ...defaultPagination,
            ...sortDirection,
            searchLoginTerm: `%${searchLoginTerm}%`,
        };
    }
}