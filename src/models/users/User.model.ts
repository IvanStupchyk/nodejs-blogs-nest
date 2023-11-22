export class UserModel {
  constructor(
    public id: string,
    public email: string,
    public login: string,
    public passwordHash: string,
    public confirmationCode: string,
    public expirationDate: string,
    public isConfirmed: boolean,
    public createdAt: string,
  ) {}
}
