export type DeviceViewType = {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;
};

export type DeviceType = {
  id: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
  deviceId: string;
  userId: string;
  createdAt: Date;
};
