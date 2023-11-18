export class DeviceType {
  constructor(
    public id: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public expirationDate: string,
    public deviceId: string,
    public userId: string,
    public createdAt: string,
  ) {}
}
