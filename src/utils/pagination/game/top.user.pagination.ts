import { DefaultPagination } from '../default.pagination';
import { TopUsersQueryParamModel } from '@app/features/quiz/models/top.users.query.param.model';

export class TopUsersPagniation extends DefaultPagination {
  constructor(private queryParam: TopUsersQueryParamModel) {
    super(queryParam.pageSize, queryParam.pageNumber);
  }

  getTopUsersPaginationForSql() {
    const defaultPagination = this.getDefaultPagination();
    const sortDirection = this.getSortDirectionForSql();

    const sort: { [column: string]: 'ASC' | 'DESC' } = {};
    console.log({ sort: this.queryParam.sort });

    if (!this.queryParam.sort) {
      (sort[`"avgScores"`] = 'DESC'), (sort[`"sumScore"`] = 'ASC');
    }

    if (typeof this.queryParam.sort === 'string') {
      const [key, order] = this.queryParam.sort.split(' ');
      sort[key] = order === 'asc' ? 'ASC' : 'DESC';
    }

    if (Array.isArray(this.queryParam.sort)) {
      this.queryParam.sort.forEach((item) => {
        const [key, order] = item.split(' ');
        sort[key] = order === 'asc' ? 'ASC' : 'DESC';
      });
    }

    return {
      ...defaultPagination,
      ...sortDirection,
      sort: sort,
    };
  }
}
