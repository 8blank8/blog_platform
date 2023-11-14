export class BannedUserForBlogCreateSqlModel {
  userId: string;
  blogId: string;
  isBanned: boolean;
  banReason: string | null;
}
