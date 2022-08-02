import { DataSource } from 'typeorm';
import configormseeds from '@app/configseedorm';
const ormDataSorce = new DataSource(configormseeds);

export default ormDataSorce;
