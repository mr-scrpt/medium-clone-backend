import configdorm from '@app/configorm';
import { DataSource } from 'typeorm';

const ormDataSorceSeeds = new DataSource(configdorm);

export default ormDataSorceSeeds;
