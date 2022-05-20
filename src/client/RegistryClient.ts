import PolyRegistryClient from '../polygon/PolyRegistryClient';
import { Registry } from '../types';

class RegistryClient implements Registry {
  protected _polyRegistry: PolyRegistryClient;

  constructor(polyRegistry: PolyRegistryClient) {
    this._polyRegistry = polyRegistry;
  }

  rootToChildToken(rootToken: string): Promise<string> {
    return this._polyRegistry.rootToChildToken(rootToken);
  }

  childToRootToken(childToken: string): Promise<string> {
    return this._polyRegistry.childToRootToken(childToken);
  }
}

export default RegistryClient;
