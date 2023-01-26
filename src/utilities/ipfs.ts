import fetch from 'cross-fetch';

import { errorMessageForError } from './messages';

export function getUrl(uri: string, gateway: string) {
  const ipfsGateway = `https://${gateway}`;
  if (!uri) return null;
  if (
    !uri.startsWith('ipfs://') &&
    !uri.startsWith('ipns://') &&
    !uri.startsWith('https://') &&
    !uri.startsWith('http://')
  )
    return `${ipfsGateway}/ipfs/${uri}`;
  const uriScheme = uri.split('://')[0];
  if (uriScheme === 'ipfs')
    return uri.replace('ipfs://', `${ipfsGateway}/ipfs/`);
  if (uriScheme === 'ipns')
    return uri.replace('ipns://', `${ipfsGateway}/ipns/`);
  return uri;
}

export async function ipfsJson(uri: string, gateway: string) {
  try {
    const url = getUrl(uri, gateway);
    if (!url) return {};
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(
      errorMessageForError('network-error', {
        message: error.message ?? error.error_description,
      })
    );
  }
}

export async function ipfsGet(
  gateway: string,
  ipfsHash: string,
  protocolType = 'ipfs'
) {
  try {
    const url = `https://${gateway}/${protocolType}/${ipfsHash}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(
      errorMessageForError('network-error', {
        message: error.message ?? error.error_description,
      })
    );
  }
}
