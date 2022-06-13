import ChildRegistryClient from '../polygon/ChildRegistryClient';
import { Registry } from '../types';

class RegistryClient implements Registry {
  protected _polyRegistry: ChildRegistryClient;

  constructor(address: string) {
    this._polyRegistry = new ChildRegistryClient(address);
  }

  rootToChildToken(rootToken: string): Promise<string> {
    return this._polyRegistry.rootToChildToken(rootToken);
  }

  childToRootToken(childToken: string): Promise<string> {
    return this._polyRegistry.childToRootToken(childToken);
  }
}

export default RegistryClient;
