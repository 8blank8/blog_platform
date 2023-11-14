import { PostQueryParamType } from '@post/models/post.query.param.type';

import { DefaultPagination } from '../default.pagination';

export class PostPagniation extends DefaultPagination {
  constructor(queryParam: PostQueryParamType) {
    super(
      queryParam.pageSize,
      queryParam.pageNumber,
      queryParam.sortBy,
      queryParam.sortDirection,
    );
  }

  getPostPaginationForSql() {
    const defaultPagination = this.getDefaultPagination();
    const sortDirection = this.getSortDirectionForSql();

    return {
      ...defaultPagination,
      ...sortDirection,
    };
  }
}
