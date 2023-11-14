import { CommentQueryParam } from '@app/features/comment/models/comment.query.param.type';

import { DefaultPagination } from '../default.pagination';

export class CommentPagniation extends DefaultPagination {
  constructor(queryParam: CommentQueryParam) {
    super(
      queryParam.pageSize,
      queryParam.pageNumber,
      queryParam.sortBy,
      queryParam.sortDirection,
    );
  }

  getCommentPaginationForSql() {
    const defaultPagination = this.getDefaultPagination();
    const sortDirection = this.getSortDirectionForSql();

    return {
      ...defaultPagination,
      ...sortDirection,
    };
  }
}
