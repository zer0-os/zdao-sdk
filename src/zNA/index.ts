import { ethers } from 'ethers';

import zDAOCore from '../config/constants/abi/zDAOCore.json';
import { zDAOId, zNA, zNAConfig } from '../types';
import { t } from '../utilities/messages';

export const createClient = (config: zNAConfig) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const contract = new ethers.Contract(
    config.contract,
    zDAOCore,
    config.provider
  );

  /**
   * Get all the list of zDAO
   */
  const listZDAOs = async (): Promise<zNA[]> => {
    // return await contract.getDAOIds();
    throw Error(t('not-implemented'));
  };

  /**
   * Get zDAO by zNA
   * @param zNA zNA address to find zDAO
   */
  const getZDAOIdByZNA = async (_: zNA): Promise<zDAOId> => {
    // return await contract.zNATozDAO(zNA);
    throw Error(t('not-implemented'));
  };

  const getDAOMetadataUri = async (_: zDAOId): Promise<string> => {
    // return await contract.getDAOMetadataUri(zDAOId);
    throw Error(t('not-implemented'));
  };

  const doesZDAOExist = async (_: zNA): Promise<boolean> => {
    // const daoId = await contract.zNATozDAO(zNA);
    // return daoId.length > 0 ? true : false;
    throw Error(t('not-implemented'));
  };

  return {
    listZDAOs,
    getZDAOIdByZNA,
    getDAOMetadataUri,
    doesZDAOExist,
  };
};
