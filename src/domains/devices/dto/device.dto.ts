import { ObjectId } from 'mongodb';

export class DeviceType {
  constructor(
    public id: ObjectId,
    public ip: string,
    public title: string,
    public lastActiveDate: Date,
    public expirationDate: Date,
    public deviceId: ObjectId,
    public userId: ObjectId,
  ) {}
}
