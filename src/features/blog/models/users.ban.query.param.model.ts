export class UsersBanQueryParamModel {
  searchLoginTerm: string | undefined;
  sortBy: string | undefined;
  sortDirection: 'asc' | 'desc' | undefined;
  pageNumber: string | undefined;
  pageSize: string | undefined;
}
