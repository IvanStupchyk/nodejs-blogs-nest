export type ShowOwnUserDataType = {
  userId: string;
  login: string;
  email: string;
};

export type UserType = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
};

type BanInfoType = {
  isBanned: boolean;
  banDate: Date;
  banReason?: string;
};
export class UserViewType {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: BanInfoType;
}

export type UsersViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};
