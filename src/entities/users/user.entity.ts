import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Device } from '../devices/device.entity';
import { InvalidRefreshToken } from './invalid-refresh-tokens.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 10 })
  login: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;

  @Column({ nullable: true, type: 'uuid' })
  confirmationCode: string | null;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  expirationDate: Date | null;

  @OneToMany(() => Device, (device) => device.user)
  device: Device[];

  @OneToMany(
    () => InvalidRefreshToken,
    (invalidRefreshToken) => invalidRefreshToken.user,
  )
  invalidRefreshToken: InvalidRefreshToken[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
