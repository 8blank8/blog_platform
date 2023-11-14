export class BannedUserForBlogSqlModel {
  id: string;
  userId: string;
  blogId: string;
  isBanned: boolean;
  banReason: string | null;
}
