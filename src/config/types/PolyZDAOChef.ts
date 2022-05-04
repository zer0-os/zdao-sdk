/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface PolyZDAOChefInterface extends utils.Interface {
  contractName: "PolyZDAOChef";
  functions: {
    "DEFAULT_ADMIN_ROLE()": FunctionFragment;
    "__ZDAOChef_init(address,address,address)": FunctionFragment;
    "childStateSender()": FunctionFragment;
    "collectProposal(uint256,uint256)": FunctionFragment;
    "getRoleAdmin(bytes32)": FunctionFragment;
    "getzDAOById(uint256)": FunctionFragment;
    "grantRole(bytes32,address)": FunctionFragment;
    "hasRole(bytes32,address)": FunctionFragment;
    "listzDAOs(uint256,uint256)": FunctionFragment;
    "numberOfzDAOs()": FunctionFragment;
    "owner()": FunctionFragment;
    "paused()": FunctionFragment;
    "processMessageFromRoot(bytes)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "renounceRole(bytes32,address)": FunctionFragment;
    "revokeRole(bytes32,address)": FunctionFragment;
    "setStaking(address)": FunctionFragment;
    "setZDAOBase(address)": FunctionFragment;
    "staking()": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "upgradeTo(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
    "version()": FunctionFragment;
    "vote(uint256,uint256,uint256)": FunctionFragment;
    "zDAOBase()": FunctionFragment;
    "zDAOIds(uint256)": FunctionFragment;
    "zDAOs(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "__ZDAOChef_init",
    values: [string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "childStateSender",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "collectProposal",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getzDAOById",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "listzDAOs",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "numberOfzDAOs",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "processMessageFromRoot",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(functionFragment: "setStaking", values: [string]): string;
  encodeFunctionData(functionFragment: "setZDAOBase", values: [string]): string;
  encodeFunctionData(functionFragment: "staking", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "upgradeTo", values: [string]): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [string, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "vote",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "zDAOBase", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "zDAOIds",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "zDAOs", values: [BigNumberish]): string;

  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__ZDAOChef_init",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "childStateSender",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "collectProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getzDAOById",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "listzDAOs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "numberOfzDAOs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "processMessageFromRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setStaking", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setZDAOBase",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "staking", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "zDAOBase", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "zDAOIds", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "zDAOs", data: BytesLike): Result;

  events: {
    "AdminChanged(address,address)": EventFragment;
    "BeaconUpgraded(address)": EventFragment;
    "CastVote(uint256,uint256,address,uint256)": EventFragment;
    "DAOCreated(address,uint256)": EventFragment;
    "DAODestroyed(uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Paused(address)": EventFragment;
    "ProposalCanceled(uint256,uint256)": EventFragment;
    "ProposalCollected(uint256,uint256,uint256,uint256,uint256)": EventFragment;
    "ProposalCreated(uint256,uint256,uint256,uint256)": EventFragment;
    "ProposalExecuted(uint256,uint256)": EventFragment;
    "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
    "RoleGranted(bytes32,address,address)": EventFragment;
    "RoleRevoked(bytes32,address,address)": EventFragment;
    "Unpaused(address)": EventFragment;
    "Upgraded(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BeaconUpgraded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CastVote"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DAOCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DAODestroyed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalCanceled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalCollected"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalExecuted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleGranted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleRevoked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}

export type AdminChangedEvent = TypedEvent<
  [string, string],
  { previousAdmin: string; newAdmin: string }
>;

export type AdminChangedEventFilter = TypedEventFilter<AdminChangedEvent>;

export type BeaconUpgradedEvent = TypedEvent<[string], { beacon: string }>;

export type BeaconUpgradedEventFilter = TypedEventFilter<BeaconUpgradedEvent>;

export type CastVoteEvent = TypedEvent<
  [BigNumber, BigNumber, string, BigNumber],
  {
    _zDAOId: BigNumber;
    _proposalId: BigNumber;
    _voter: string;
    _choice: BigNumber;
  }
>;

export type CastVoteEventFilter = TypedEventFilter<CastVoteEvent>;

export type DAOCreatedEvent = TypedEvent<
  [string, BigNumber],
  { _zDAO: string; _daoId: BigNumber }
>;

export type DAOCreatedEventFilter = TypedEventFilter<DAOCreatedEvent>;

export type DAODestroyedEvent = TypedEvent<[BigNumber], { _daoId: BigNumber }>;

export type DAODestroyedEventFilter = TypedEventFilter<DAODestroyedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type PausedEvent = TypedEvent<[string], { account: string }>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export type ProposalCanceledEvent = TypedEvent<
  [BigNumber, BigNumber],
  { _zDAOId: BigNumber; _proposalId: BigNumber }
>;

export type ProposalCanceledEventFilter =
  TypedEventFilter<ProposalCanceledEvent>;

export type ProposalCollectedEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber],
  {
    _zDAOId: BigNumber;
    _proposalId: BigNumber;
    _voters: BigNumber;
    _yes: BigNumber;
    _no: BigNumber;
  }
>;

export type ProposalCollectedEventFilter =
  TypedEventFilter<ProposalCollectedEvent>;

export type ProposalCreatedEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, BigNumber],
  {
    _zDAOId: BigNumber;
    _proposalId: BigNumber;
    _startTimestamp: BigNumber;
    _endTimestamp: BigNumber;
  }
>;

export type ProposalCreatedEventFilter = TypedEventFilter<ProposalCreatedEvent>;

export type ProposalExecutedEvent = TypedEvent<
  [BigNumber, BigNumber],
  { _zDAOId: BigNumber; _proposalId: BigNumber }
>;

export type ProposalExecutedEventFilter =
  TypedEventFilter<ProposalExecutedEvent>;

export type RoleAdminChangedEvent = TypedEvent<
  [string, string, string],
  { role: string; previousAdminRole: string; newAdminRole: string }
>;

export type RoleAdminChangedEventFilter =
  TypedEventFilter<RoleAdminChangedEvent>;

export type RoleGrantedEvent = TypedEvent<
  [string, string, string],
  { role: string; account: string; sender: string }
>;

export type RoleGrantedEventFilter = TypedEventFilter<RoleGrantedEvent>;

export type RoleRevokedEvent = TypedEvent<
  [string, string, string],
  { role: string; account: string; sender: string }
>;

export type RoleRevokedEventFilter = TypedEventFilter<RoleRevokedEvent>;

export type UnpausedEvent = TypedEvent<[string], { account: string }>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export type UpgradedEvent = TypedEvent<[string], { implementation: string }>;

export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;

export interface PolyZDAOChef extends BaseContract {
  contractName: "PolyZDAOChef";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PolyZDAOChefInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<[string]>;

    __ZDAOChef_init(
      _stakingBase: string,
      _childStateSender: string,
      _zDAOBase: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    childStateSender(overrides?: CallOverrides): Promise<[string]>;

    collectProposal(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<[string]>;

    getzDAOById(
      _daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    listzDAOs(
      _startIndex: BigNumberish,
      _endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    processMessageFromRoot(
      _message: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setStaking(
      _staking: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setZDAOBase(
      _zDAOBase: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    staking(overrides?: CallOverrides): Promise<[string]>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    upgradeTo(
      newImplementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;

    vote(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      _choice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    zDAOBase(overrides?: CallOverrides): Promise<[string]>;

    zDAOIds(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    zDAOs(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
  };

  DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  __ZDAOChef_init(
    _stakingBase: string,
    _childStateSender: string,
    _zDAOBase: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  childStateSender(overrides?: CallOverrides): Promise<string>;

  collectProposal(
    _daoId: BigNumberish,
    _proposalId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<string>;

  getzDAOById(_daoId: BigNumberish, overrides?: CallOverrides): Promise<string>;

  grantRole(
    role: BytesLike,
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  hasRole(
    role: BytesLike,
    account: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  listzDAOs(
    _startIndex: BigNumberish,
    _endIndex: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  processMessageFromRoot(
    _message: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceRole(
    role: BytesLike,
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  revokeRole(
    role: BytesLike,
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setStaking(
    _staking: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setZDAOBase(
    _zDAOBase: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  staking(overrides?: CallOverrides): Promise<string>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  upgradeTo(
    newImplementation: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  upgradeToAndCall(
    newImplementation: string,
    data: BytesLike,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  vote(
    _daoId: BigNumberish,
    _proposalId: BigNumberish,
    _choice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  zDAOBase(overrides?: CallOverrides): Promise<string>;

  zDAOIds(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

  zDAOs(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    __ZDAOChef_init(
      _stakingBase: string,
      _childStateSender: string,
      _zDAOBase: string,
      overrides?: CallOverrides
    ): Promise<void>;

    childStateSender(overrides?: CallOverrides): Promise<string>;

    collectProposal(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<string>;

    getzDAOById(
      _daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    listzDAOs(
      _startIndex: BigNumberish,
      _endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    processMessageFromRoot(
      _message: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setStaking(_staking: string, overrides?: CallOverrides): Promise<void>;

    setZDAOBase(_zDAOBase: string, overrides?: CallOverrides): Promise<void>;

    staking(overrides?: CallOverrides): Promise<string>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeTo(
      newImplementation: string,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    version(overrides?: CallOverrides): Promise<BigNumber>;

    vote(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      _choice: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    zDAOBase(overrides?: CallOverrides): Promise<string>;

    zDAOIds(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    zDAOs(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "AdminChanged(address,address)"(
      previousAdmin?: null,
      newAdmin?: null
    ): AdminChangedEventFilter;
    AdminChanged(
      previousAdmin?: null,
      newAdmin?: null
    ): AdminChangedEventFilter;

    "BeaconUpgraded(address)"(
      beacon?: string | null
    ): BeaconUpgradedEventFilter;
    BeaconUpgraded(beacon?: string | null): BeaconUpgradedEventFilter;

    "CastVote(uint256,uint256,address,uint256)"(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null,
      _voter?: string | null,
      _choice?: null
    ): CastVoteEventFilter;
    CastVote(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null,
      _voter?: string | null,
      _choice?: null
    ): CastVoteEventFilter;

    "DAOCreated(address,uint256)"(
      _zDAO?: string | null,
      _daoId?: BigNumberish | null
    ): DAOCreatedEventFilter;
    DAOCreated(
      _zDAO?: string | null,
      _daoId?: BigNumberish | null
    ): DAOCreatedEventFilter;

    "DAODestroyed(uint256)"(
      _daoId?: BigNumberish | null
    ): DAODestroyedEventFilter;
    DAODestroyed(_daoId?: BigNumberish | null): DAODestroyedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "ProposalCanceled(uint256,uint256)"(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null
    ): ProposalCanceledEventFilter;
    ProposalCanceled(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null
    ): ProposalCanceledEventFilter;

    "ProposalCollected(uint256,uint256,uint256,uint256,uint256)"(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null,
      _voters?: null,
      _yes?: null,
      _no?: null
    ): ProposalCollectedEventFilter;
    ProposalCollected(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null,
      _voters?: null,
      _yes?: null,
      _no?: null
    ): ProposalCollectedEventFilter;

    "ProposalCreated(uint256,uint256,uint256,uint256)"(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null,
      _startTimestamp?: null,
      _endTimestamp?: null
    ): ProposalCreatedEventFilter;
    ProposalCreated(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null,
      _startTimestamp?: null,
      _endTimestamp?: null
    ): ProposalCreatedEventFilter;

    "ProposalExecuted(uint256,uint256)"(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null
    ): ProposalExecutedEventFilter;
    ProposalExecuted(
      _zDAOId?: BigNumberish | null,
      _proposalId?: BigNumberish | null
    ): ProposalExecutedEventFilter;

    "RoleAdminChanged(bytes32,bytes32,bytes32)"(
      role?: BytesLike | null,
      previousAdminRole?: BytesLike | null,
      newAdminRole?: BytesLike | null
    ): RoleAdminChangedEventFilter;
    RoleAdminChanged(
      role?: BytesLike | null,
      previousAdminRole?: BytesLike | null,
      newAdminRole?: BytesLike | null
    ): RoleAdminChangedEventFilter;

    "RoleGranted(bytes32,address,address)"(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): RoleGrantedEventFilter;
    RoleGranted(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): RoleGrantedEventFilter;

    "RoleRevoked(bytes32,address,address)"(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): RoleRevokedEventFilter;
    RoleRevoked(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): RoleRevokedEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;

    "Upgraded(address)"(implementation?: string | null): UpgradedEventFilter;
    Upgraded(implementation?: string | null): UpgradedEventFilter;
  };

  estimateGas: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    __ZDAOChef_init(
      _stakingBase: string,
      _childStateSender: string,
      _zDAOBase: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    childStateSender(overrides?: CallOverrides): Promise<BigNumber>;

    collectProposal(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getRoleAdmin(
      role: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getzDAOById(
      _daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listzDAOs(
      _startIndex: BigNumberish,
      _endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    processMessageFromRoot(
      _message: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setStaking(
      _staking: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setZDAOBase(
      _zDAOBase: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    staking(overrides?: CallOverrides): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    upgradeTo(
      newImplementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;

    vote(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      _choice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    zDAOBase(overrides?: CallOverrides): Promise<BigNumber>;

    zDAOIds(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    zDAOs(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    DEFAULT_ADMIN_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    __ZDAOChef_init(
      _stakingBase: string,
      _childStateSender: string,
      _zDAOBase: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    childStateSender(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    collectProposal(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getRoleAdmin(
      role: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getzDAOById(
      _daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listzDAOs(
      _startIndex: BigNumberish,
      _endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    processMessageFromRoot(
      _message: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setStaking(
      _staking: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setZDAOBase(
      _zDAOBase: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    staking(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    upgradeTo(
      newImplementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    vote(
      _daoId: BigNumberish,
      _proposalId: BigNumberish,
      _choice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    zDAOBase(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    zDAOIds(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    zDAOs(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
