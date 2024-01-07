import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/User.entity';

@Entity('telegram-bot-subscribers')
export class TelegramBotSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  activationCode: string;

  @Column({ type: 'bigint', nullable: true })
  telegramId: number;

  @OneToOne(() => User, (user) => user.telegramBotSubscriber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
