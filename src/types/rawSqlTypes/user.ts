export type UserType = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};
