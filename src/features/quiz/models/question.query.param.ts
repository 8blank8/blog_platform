export class QuestionQueryParam {
  bodySearchTerm: string | undefined;
  publishedStatus: 'all' | 'published' | 'notPublished';
  sortBy: string | undefined;
  sortDirection: 'asc' | 'desc' | undefined;
  pageNumber: string | undefined;
  pageSize: string | undefined;
}
