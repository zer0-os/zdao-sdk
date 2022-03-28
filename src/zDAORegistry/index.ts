import { ethers } from 'ethers';

import zDAOCore from '../config/constants/abi/zDAOCore.json';
import { zDAOId, zNA, zNAConfig } from '../types';
import { errorMessageForError } from '../utilities/messages';

class zDAORegistryClient {
  private readonly _config: zNAConfig;
  protected readonly _contract: ethers.Contract;

  constructor(config: zNAConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.contract,
      zDAOCore,
      config.provider
    );
  }

  listZDAOs(): Promise<zNA[]> {
    throw Error(errorMessageForError('not-implemented'));
  }

  getZDAOIdByZNA(_: zNA): Promise<zDAOId> {
    throw Error(errorMessageForError('not-implemented'));
  }

  getDAOMetadataUri(_: zDAOId): Promise<string> {
    throw Error(errorMessageForError('not-implemented'));
  }

  doesZDAOExist(_: zNA): Promise<boolean> {
    throw Error(errorMessageForError('not-implemented'));
  }
}

export default zDAORegistryClient;
