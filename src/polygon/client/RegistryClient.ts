import PolygonRegistryClient from '../polygon/PolygonRegistryClient';
import { Registry } from '../types';

class RegistryClient implements Registry {
  protected readonly polyRegistry: PolygonRegistryClient;

  constructor(address: string) {
    this.polyRegistry = new PolygonRegistryClient(address);
  }

  ethereumToPolygonToken(ethereumToken: string): Promise<string> {
    return this.polyRegistry.rootToChildToken(ethereumToken);
  }

  polygonToEthereumToken(polygonToken: string): Promise<string> {
    return this.polyRegistry.childToRootToken(polygonToken);
  }
}

export default RegistryClient;
