import { DefaultPagination } from '../default.pagination';
import { QuestionQueryParam } from '../../../features/quiz/models/question.query.param';
import { QUERY_PARAM_SQL } from '../../../utils/enum/query.param.enum.sql';

export class QuestPagniation extends DefaultPagination {
  constructor(private queryParam: QuestionQueryParam) {
    super(
      queryParam.pageSize,
      queryParam.pageNumber,
      queryParam.sortBy,
      queryParam.sortDirection,
    );
  }

  private getPublishedStatus(status: string) {
    switch (status) {
      case 'published':
        return true;
      case 'notPublished':
        return false;
      default:
        return null;
    }
  }

  getQuestPaginationForSql() {
    const defaultPagination = this.getDefaultPagination();
    const sortDirection = this.getSortDirectionForSql();

    const publishedStatus = this.getPublishedStatus(
      this.queryParam.publishedStatus,
    );
    const bodySearchTerm =
      this.queryParam.bodySearchTerm ?? QUERY_PARAM_SQL.SEARCH_NAME_TERM;

    return {
      ...defaultPagination,
      ...sortDirection,
      publishedStatus: publishedStatus,
      bodySearchTerm: `%${bodySearchTerm}%`,
    };
  }
}
