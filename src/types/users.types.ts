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

export class UserViewType {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
}

export type UsersViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};

export type InvalidRefreshTokenType = {
  id: string;
  userId: string;
  refreshToken: string;
  createdAt: string;
};
