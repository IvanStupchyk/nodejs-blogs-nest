import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const globalBdOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_SQL_HOST,
  port: 5432,
  username: process.env.DATABASE_SQL_USERNAME,
  password: process.env.DATABASE_SQL_PASSWORD,
  database: process.env.DATABASE_NAME_SQL_TYPEORM,
  autoLoadEntities: true,
  synchronize: true,
  ssl: true,
};

export const localBdOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DATABASE_SQL_USERNAME_LOCAL,
  password: process.env.DATABASE_SQL_PASSWORD_LOCAL,
  database: 'postgres_typeorm',
  autoLoadEntities: true,
  synchronize: true,
};
