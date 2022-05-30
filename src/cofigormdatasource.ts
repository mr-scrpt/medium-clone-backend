import ormconfig from '@app/configorm';
import { DataSource } from 'typeorm';

const ormDataSorce = new DataSource(ormconfig);

export default ormDataSorce;
