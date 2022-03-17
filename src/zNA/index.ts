import { zDAO } from '../snapshot-io/types';
import { zNAConfig } from '../types';

export const createClient = (config: zNAConfig, chainId: string) => {
  /**
   * Get all the list of zDAO
   */
  const getZDAOs = async (): Promise<zDAO[]> => {
    return [];
  };

  /**
   * Get zDAO by zNA
   * @param zNA zNA address to find zDAO
   */
  const getZDAOByZNA = async (zNA: string): Promise<zDAO | undefined> => {
    return undefined;
  };

  return {
    getZDAOs,
    getZDAOByZNA,
  };
};
