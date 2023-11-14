import { UserQueryParamType } from '../../../features/user/models/user.query.param.type';
import { QUERY_PARAM_SQL } from '../../enum/query.param.enum.sql';
import { DefaultPagination } from '../default.pagination';

export class UserPagination extends DefaultPagination {
  constructor(private queryParam: UserQueryParamType) {
    super(
      queryParam.pageSize,
      queryParam.pageNumber,
      queryParam.sortBy,
      queryParam.sortDirection,
    );
  }

  getPaginationUserForSql() {
    const {
      searchLoginTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
      searchEmailTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
    } = this.queryParam;

    const defaultPagination = this.getDefaultPagination();
    const sortDirrection = this.getSortDirectionForSql();

    return {
      ...defaultPagination,
      ...sortDirrection,
      searchLoginTerm: `%${searchLoginTerm}%`,
      searchEmailTerm: `%${searchEmailTerm}%`,
    };
  }
}
