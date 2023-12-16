import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/User.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @ManyToOne(() => User, (user) => user.device, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(
    deviceId: string,
    userAgent: string,
    ip: string,
    userId: User,
    iat: number,
    exp: number,
  ): Device {
    const device = new Device();
    device.deviceId = deviceId;
    device.title = userAgent;
    device.ip = ip;
    device.user = userId;
    device.lastActiveDate = new Date(iat * 1000);
    device.expirationDate = new Date(exp * 1000);

    return device;
  }
}
