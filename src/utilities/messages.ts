const ErrorMessages = [
  {
    key: 'no-private-key',
    value: 'No private key',
  },
  {
    key: 'not-found-zdao',
    value: 'Not found zDAO',
  },
  {
    key: 'empty-zdao-title',
    value: 'Empty zDAO title',
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
    key: 'empty-voting-token',
    value: 'Empty Voting ERC20 Token address',
  },
  {
    key: 'already-exist-zdao',
    value: 'zDAO already exists',
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
    key: 'failed-create-token',
    value: 'Failed to create zToken',
  },
  {
    key: 'failed-create-proposal',
    value: 'Failed to create proposal',
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
    key: 'invalid-ens',
    value: 'Invalid ENS',
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
    key: 'should-hold-token',
    value: 'Should hold at least %amount% tokens',
  },
  {
    key: 'not-executable-proposal',
    value: 'Not a executable proposal',
  },
  {
    key: 'proposal-already-executed',
    value: 'Proposal was already executed',
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

export const raiseError = (error: ErrorType): void => {
  throw new Error(errorMessageForError(error));
};
