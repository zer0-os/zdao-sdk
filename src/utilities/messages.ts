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
    key: 'invalid-quorum-amount',
    value: 'Invalid Quorum votes',
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
    key: 'not-sync-state',
    value: 'Please wait more time to sync state into Polygon network',
  },
  {
    key: 'not-found-proposal',
    value: 'Not Found a proposal',
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
