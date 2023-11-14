export class UserQueryParamType {
  sortBy: string | undefined;
  sortDirection: 'asc' | 'desc' | undefined;
  pageNumber: string | undefined;
  pageSize: string | undefined;
  searchLoginTerm: string | undefined;
  searchEmailTerm: string | undefined;
  banStatus: string | undefined;
}
