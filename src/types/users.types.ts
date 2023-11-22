import { UserViewType } from './user-view.type';

export type ShowOwnUserDataType = {
  userId: string;
  login: string;
  email: string;
};

export type UsersType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};
