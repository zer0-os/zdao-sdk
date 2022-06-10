export enum SupportedChainId {
  MAINNET = 1,
  // ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  MUMBAI = 80001,
  POLYGON = 137,
}

export enum zDAOState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
}

export enum ProposalState {
  // The proposal was created and waiting to synchronized to Polygon
  PENDING = 'PENDING',
  // The proposal was canceled before calculation
  CANCELED = 'CANCELED',
  // The proposal was successfully created and sychronized to Polygon,
  // voters can participate a voting.
  ACTIVE = 'ACTIVE',
  // The proposal was ended and ready to calculate voting result on Polygon
  // and send it to Ethereum
  AWAITING_CALCULATION = 'AWAITING_CALCULATION',
  // The proposal was triggerred the calculation of voting result on Polygon
  // and sending it to Ethereum
  BRIDGING = 'BRIDGING',
  // The calculated voting result was arrived on Ethereum and ready to
  // finalize result
  AWAITING_FINALIZATION = 'AWAITING_FINALIZATION',
  // The proposal was succeeded on voting and ready to execute proposal
  AWAITING_EXECUTION = 'AWAITING_EXECUTING',
  // The proposal was failed on voting
  FAILED = 'FAILED',
  // The proposal was successfully executed
  EXECUTED = 'EXECUTED',
}

export enum AssetType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  NATIVE_TOKEN = 'NATIVE_TOKEN',
}

export enum TransactionType {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
}

export enum TransactionStatus {
  AWAITING_CONFIRMATIONS = 'AWAITING_CONFIRMATIONS',
  AWAITING_EXECUTION = 'AWAITING_EXECUTION',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  WILL_BE_REPLACED = 'WILL_BE_REPLACED',
}
