export const fetchIpfs = async (gateway: string, ipfsHash: string) => {
  const url = `https://${gateway}/ipfs/${ipfsHash}`;
  return fetch(url).then((res) => res.json());
};
