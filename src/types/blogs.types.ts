type BanInfoType = {
  isBanned: boolean;
  banDate: Date | null;
};

export type BlogViewType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type BlogsViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogViewType>;
};

type UserViewType = {
  userId: string | null;
  userLogin: string | null;
};

type BlogViewSAType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  banInfo: BanInfoType;
  blogOwnerInfo: UserViewType;
};

export type BlogsViewSAType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogViewSAType>;
};
