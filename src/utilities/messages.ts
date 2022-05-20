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
] as const;

export type ErrorType = typeof ErrorMessages[number]['key'];

export const errorMessageForError = (error: ErrorType): string => {
  const found = ErrorMessages.find((item) => item.key === error);
  return found ? found.value : 'Unknown Error';
};

export const raiseError = (error: ErrorType): void => {
  throw new Error(errorMessageForError(error));
};
