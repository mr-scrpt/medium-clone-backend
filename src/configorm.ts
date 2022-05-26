import { DataSourceOptions } from 'typeorm';

const ormconfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mediumclone',
  username: 'mediumclone',
  password: '101601630',
  entities: [`${__dirname}/**/*entity{.ts,.js}`],
  synchronize: true,
};

export default ormconfig;