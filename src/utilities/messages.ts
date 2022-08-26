const ErrorMessages = [
  {
    key: 'no-private-key',
    value: 'No private key',
  },
  {
    key: 'no-found-signer',
    value: 'Not found signer',
  },
  {
    key: 'not-found-zdao',
    value: 'Not found zDAO',
  },
  {
    key: 'empty-zdao-name',
    value: 'Empty zDAO name',
  },
  {
    key: 'empty-zdao-creator',
    value: 'Empty zDAO creator',
  },
  {
    key: 'empty-gnosis-address',
    value: 'Empty Gnosis Safe address',
  },
  {
    key: 'empty-gnosis-owners',
    value: 'Empty Gnosis Safe owners',
  },
  {
    key: 'empty-proposal-token',
    value: 'Empty ERC20 Token address to become proposal creator',
  },
  {
    key: 'invalid-proposal-token-amount',
    value: 'Invalid Token amount to become proposal creator',
  },
  {
    key: 'empty-voting-token',
    value: 'Empty ERC20 Voting Token address',
  },
  {
    key: 'invalid-quorum-amount',
    value: 'Invalid minimum total voting tokens',
  },
  {
    key: 'empty-ens',
    value: 'Empty ENS',
  },
  {
    key: 'not-zna-owner',
    value: 'Not a zNA owner',
  },
  {
    key: 'already-exist-zdao',
    value: 'zDAO already exists',
  },
  {
    key: 'already-destroyed',
    value: 'Already destroyed',
  },
  {
    key: 'empty-metadata',
    value: 'Not found Token Transfer information',
  },
  {
    key: 'not-gnosis-owner',
    value: 'Not a Gnosis Safe owner address',
  },
  {
    key: 'not-implemented',
    value: 'Not implemented',
  },
  {
    key: 'not-initialized',
    value: 'Not initialized',
  },
  {
    key: 'failed-create-zdao',
    value: 'Failed to create zDAO',
  },
  {
    key: 'failed-create-proposal',
    value: 'Failed to create proposal',
  },
  {
    key: 'failed-create-token',
    value: 'Failed to create zToken',
  },
  {
    key: 'should-hold-token',
    value: 'Should hold at least %amount% tokens',
  },
  {
    key: 'not-sync-state',
    value: 'Pending for state sync into Polygon network',
  },
  {
    key: 'not-found-proposal',
    value: 'Not Found a proposal',
  },
  {
    key: 'not-active-proposal',
    value: 'Not a active proposal',
  },
  {
    key: 'zero-voting-power',
    value: 'Should have voting power',
  },
  {
    key: 'not-found-ens-in-snapshot',
    value: 'Not found space with given ens in snapshot',
  },
  {
    key: 'not-found-strategy-in-snapshot',
    value: 'Not found any token related strategyies in snapshot',
  },
  {
    key: 'invalid-parameter',
    value: 'Invalid parameter: %name%',
  },
  {
    key: 'invalid-ens',
    value: 'Invalid ENS',
  },
  {
    key: 'invalid-zdao-duration',
    value: 'Not found zDAO duration',
  },
  {
    key: 'invalid-proposal-duration',
    value: 'Not found proposal duration',
  },
  {
    key: 'invalid-choices-for-funding-proposal',
    value: 'Funding proposal should have only two choices',
  },
  {
    key: 'not-support-total-supply',
    value: 'Voting token does not support total supply',
  },
] as const;

export type ErrorType = typeof ErrorMessages[number]['key'];

export const errorMessageForError = (
  error: ErrorType,
  args?: { [key: string]: string }
): string => {
  const found = ErrorMessages.find((item) => item.key === error);
  let plain = found ? found.value : 'Unknown Error';
  if (args) {
    Object.keys(args).forEach((key) => {
      const reg = new RegExp(`%${key}%`, 'g');
      plain = plain.replace(reg, args[key].toString());
    });
  }

  return plain;
};
