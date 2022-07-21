import PolygonRegistryClient from '../polygon/PolygonRegistryClient';
import { Registry } from '../types';
import GlobalClient from './GlobalClient';

class RegistryClient implements Registry {
  protected polyRegistry?: PolygonRegistryClient;

  private async getPolygonRegistryClient(): Promise<PolygonRegistryClient> {
    if (!this.polyRegistry) {
      const registryAddress =
        await GlobalClient.polygonZDAOChef.getRegistryAddress();
      this.polyRegistry = new PolygonRegistryClient(registryAddress);
    }
    return this.polyRegistry;
  }

  async ethereumToPolygonToken(ethereumToken: string): Promise<string> {
    return this.getPolygonRegistryClient().then((instance) =>
      instance.rootToChildToken(ethereumToken)
    );
  }

  async polygonToEthereumToken(polygonToken: string): Promise<string> {
    return this.getPolygonRegistryClient().then((instance) =>
      instance.childToRootToken(polygonToken)
    );
  }
}

export default RegistryClient;
