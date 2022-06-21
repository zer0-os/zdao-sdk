import PolygonRegistryClient from '../polygon/PolygonRegistryClient';
import { Registry } from '../types';

class RegistryClient implements Registry {
  protected _polyRegistry: PolygonRegistryClient;

  constructor(address: string) {
    this._polyRegistry = new PolygonRegistryClient(address);
  }

  ethereumToPolygonToken(ethereumToken: string): Promise<string> {
    return this._polyRegistry.rootToChildToken(ethereumToken);
  }

  polygonToEthereumToken(polygonToken: string): Promise<string> {
    return this._polyRegistry.childToRootToken(polygonToken);
  }
}

export default RegistryClient;
