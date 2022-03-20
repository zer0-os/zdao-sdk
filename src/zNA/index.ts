import { ethers } from 'ethers';

import zDAOCore from '../config/constants/abi/zDAOCore.json';
import { zDAOId, zNA, zNAConfig } from '../types';

export const createClient = (config: zNAConfig) => {
  const contract = new ethers.Contract(
    config.contract,
    zDAOCore,
    config.provider
  );

  /**
   * Get all the list of zDAO
   */
  const listZNA = async (): Promise<zNA[]> => {
    return await contract.getDAOIds();
  };

  /**
   * Get zDAO by zNA
   * @param zNA zNA address to find zDAO
   */
  const getZDAOIdByZNA = async (zNA: zNA): Promise<zDAOId> => {
    return await contract.zNATozDAO(zNA);
  };

  const getDAOMetadataUri = async (zDAOId: zDAOId): Promise<string> => {
    return await contract.getDAOMetadataUri(zDAOId);
  };

  const doesZDAOExist = async (zNA: zNA): Promise<boolean> => {
    const daoId = await contract.zNATozDAO(zNA);
    return daoId.length > 0 ? true : false;
  };

  return {
    listZNA,
    getZDAOIdByZNA,
    getDAOMetadataUri,
    doesZDAOExist,
  };
};
