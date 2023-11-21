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

    let banStatus: { banStatus1: boolean, banStatus2: boolean } = {
      banStatus1: true,
      banStatus2: false
    }

    if (this.queryParam.banStatus === 'banned') {
      banStatus.banStatus1 = true
      banStatus.banStatus2 = true
    }
    if (this.queryParam.banStatus === 'notBanned') {
      banStatus.banStatus1 = false
      banStatus.banStatus2 = false
    }

    const defaultPagination = this.getDefaultPagination();
    const sortDirrection = this.getSortDirectionForSql();

    return {
      ...defaultPagination,
      ...sortDirrection,
      searchLoginTerm: `%${searchLoginTerm}%`,
      searchEmailTerm: `%${searchEmailTerm}%`,
      banStatus: banStatus
    };
  }
}
