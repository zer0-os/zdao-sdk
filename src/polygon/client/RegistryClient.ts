import PolygonRegistryClient from '../polygon/PolygonRegistryClient';
import { Registry, RegistryProperties } from '../types';

class RegistryClient implements Registry {
  protected properties: RegistryProperties;
  protected polyRegistry: PolygonRegistryClient;

  constructor(properties: RegistryProperties) {
    this.properties = properties;
    this.polyRegistry = new PolygonRegistryClient(properties.address);
  }

  async ethereumToPolygonToken(ethereumToken: string): Promise<string> {
    return this.polyRegistry.rootToChildToken(ethereumToken);
  }

  async polygonToEthereumToken(polygonToken: string): Promise<string> {
    return this.polyRegistry.childToRootToken(polygonToken);
  }
}

export default RegistryClient;
