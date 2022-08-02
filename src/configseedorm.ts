import configorm from '@app/configorm';
import { DataSourceOptions } from 'typeorm';

const configseedorm: DataSourceOptions = {
  ...configorm,
  migrations: [`${__dirname}/seeds/**/*{.ts,.js}`],
};

export default configseedorm;
