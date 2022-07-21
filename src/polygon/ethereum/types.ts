import { zDAOProperties } from '../../types';

export type EthereumZDAOProperties = Omit<zDAOProperties, 'state'>;
