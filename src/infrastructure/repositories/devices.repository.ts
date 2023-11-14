import { Injectable } from '@nestjs/common';
import { DeviceViewType } from '../../types/general.types';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../../schemas/device.schema';
import { DeviceType } from '../../domains/devices/dto/device.dto';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: Model<DeviceDocument>,
  ) {}
  async getUserSessions(userId: ObjectId): Promise<Array<DeviceViewType>> {
    const result: Array<DeviceType> = await this.DeviceModel.find(
      { userId },
      { _id: 0, __v: 0 },
    ).lean();

    return result.length
      ? result.map((el) => {
          return {
            ip: el.ip,
            title: el.title,
            lastActiveDate: el.lastActiveDate,
            deviceId: el.deviceId,
          };
        })
      : [];
  }

  async setNewDevice(device: DeviceType): Promise<boolean> {
    const deviceInstance = new this.DeviceModel();

    deviceInstance.id = device.id;
    deviceInstance.ip = device.ip;
    deviceInstance.title = device.title;
    deviceInstance.refreshToken = device.refreshToken;
    deviceInstance.lastActiveDate = device.lastActiveDate;
    deviceInstance.expirationDate = device.expirationDate;
    deviceInstance.deviceId = device.deviceId;
    deviceInstance.userId = device.userId;

    return !!(await deviceInstance.save());
  }

  async updateExistingSession(
    deviceId: ObjectId,
    lastActiveDate: Date,
    expirationDate: Date,
    refreshToken: string,
  ): Promise<boolean> {
    const isUpdated = await this.DeviceModel.updateOne(
      { deviceId },
      { $set: { lastActiveDate, expirationDate, refreshToken } },
    ).exec();

    return isUpdated.modifiedCount === 1;
  }

  async removeSpecifiedSession(
    userId: ObjectId,
    deviceId: string,
  ): Promise<boolean> {
    const isDeleted = await this.DeviceModel.deleteOne({
      userId,
      deviceId,
    }).exec();

    return isDeleted.deletedCount === 1;
  }

  async findDeviceById(deviceId: ObjectId): Promise<boolean> {
    return !!(await this.DeviceModel.findOne({ deviceId }).exec());
  }

  async fetchAllDeviceDataById(deviceId: ObjectId): Promise<DeviceDocument> {
    return await this.DeviceModel.findOne({ deviceId }).exec();
  }

  async removeAllExceptCurrentSessions(
    deviceId: ObjectId,
    userId: ObjectId,
  ): Promise<boolean> {
    const deletedCount = await this.DeviceModel.deleteMany({
      deviceId: { $ne: deviceId },
      userId,
    }).exec();

    return deletedCount.deletedCount >= 0;
  }
}
