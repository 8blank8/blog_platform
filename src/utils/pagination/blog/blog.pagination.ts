import { BlogQueryParamModel } from '../../../features/sa/infrastructure/models/blog.query.param';
import { DefaultPagination } from '../default.pagination';
import { QUERY_PARAM_SQL } from '../../../utils/enum/query.param.enum.sql';

export class BlogPagination extends DefaultPagination {
  constructor(private queryParam: BlogQueryParamModel) {
    super(
      queryParam.pageSize,
      queryParam.pageNumber,
      queryParam.sortBy,
      queryParam.sortDirection,
    );
  }

  getBlogPaginationForSql() {
    const defaultPagination = this.getDefaultPagination();
    const sortDirection = this.getSortDirectionForSql();

    const { searchNameTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM } =
      this.queryParam;

    return {
      ...defaultPagination,
      ...sortDirection,
      searchNameTerm: `%${searchNameTerm}%`,
    };
  }
}
