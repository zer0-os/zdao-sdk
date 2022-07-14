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
  // The proposal was created and waiting to be synchronized to Polygon.
  PENDING = 'PENDING',
  // The proposal was canceled before calculation
  CANCELED = 'CANCELED',
  // The proposal was successfully created and synchronized to Polygon, voters
  // can participate in voting.
  ACTIVE = 'ACTIVE',
  // The proposal was ended and ready to calculate the voting result on Polygon
  // and send it to Ethereum.
  AWAITING_CALCULATION = 'AWAITING_CALCULATION',
  // The proposal triggered the calculation of the voting result on Polygon and
  // sent it to Ethereum.
  BRIDGING = 'BRIDGING',
  // The calculated voting result arrived on Ethereum and is ready to finalize
  // the result.
  AWAITING_FINALIZATION = 'AWAITING_FINALIZATION',
  // The proposal is succeeded in voting and is ready to execute the proposal.
  AWAITING_EXECUTION = 'AWAITING_EXECUTING',
  // The proposal failed on voting.
  FAILED = 'FAILED',
  // The proposal was closed without execution, Gnosis Owners can execute as they decide, this state is only available on Snapshot.org
  CLOSED = 'CLOSED',
  // The proposal is successfully executed
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
