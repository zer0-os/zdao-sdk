import { BigNumber, ethers, Signature } from 'ethers';

import { EIP712Domain } from '../config';

export const timestamp = (d: Date) => parseInt((d.getTime() / 1e3).toFixed());

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m));

// add 10%
export const calculateGasMargin = (value: BigNumber): BigNumber => {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
};

const EIP712DOMAIN_TYPEHASH = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes(
    'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
  )
);

export const getDomainSeparator = (
  name: string,
  version: string,
  chainId: number,
  verifyingContract: string
) => {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        EIP712DOMAIN_TYPEHASH,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name)),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(version)),
        chainId,
        verifyingContract,
      ]
    )
  );
};

export const sign = (
  chainId: number,
  privateKey: string,
  verifyingContract: string,
  hash: string
): Signature => {
  const DOMAIN_SEPARATOR = getDomainSeparator(
    EIP712Domain.name,
    EIP712Domain.version,
    chainId,
    verifyingContract
  );
  const digest = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      ['0x19', '0x01', DOMAIN_SEPARATOR, hash]
    )
  );
  const key = new ethers.utils.SigningKey(ethers.utils.hexlify(privateKey));
  const signDigest = key.signDigest.bind(key);
  const signature = ethers.utils.joinSignature(signDigest(digest));

  return ethers.utils.splitSignature(signature);
};
