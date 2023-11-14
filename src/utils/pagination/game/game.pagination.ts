import { QuizGameQueryParamModel } from '@app/features/quiz/models/quiz.game.query.param.model';

import { DefaultPagination } from '../default.pagination';

export class GamePagniation extends DefaultPagination {
  constructor(private queryParam: QuizGameQueryParamModel) {
    super(
      queryParam.pageSize,
      queryParam.pageNumber,
      queryParam.sortBy,
      queryParam.sortDirection,
    );
  }

  getGamePaginationForSql() {
    const defaultPagination = this.getDefaultPagination();
    const sortDirection = this.getSortDirectionForSql();

    const sortBy = this.queryParam.sortBy ?? 'pairCreatedDate';

    return {
      ...defaultPagination,
      ...sortDirection,
      sortBy: `"${sortBy}"`,
    };
  }
}
