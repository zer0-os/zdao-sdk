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

export interface StakingInterface extends utils.Interface {
  contractName: "Staking";
  functions: {
    "DEFAULT_ADMIN_ROLE()": FunctionFragment;
    "__Staking_init()": FunctionFragment;
    "getRoleAdmin(bytes32)": FunctionFragment;
    "grantRole(bytes32,address)": FunctionFragment;
    "hasRole(bytes32,address)": FunctionFragment;
    "isStakedERC721(address,address,uint256)": FunctionFragment;
    "onERC721Received(address,address,uint256,bytes)": FunctionFragment;
    "owner()": FunctionFragment;
    "pastStakingPower(address,address,uint256)": FunctionFragment;
    "paused()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "renounceRole(bytes32,address)": FunctionFragment;
    "revokeRole(bytes32,address)": FunctionFragment;
    "stakeERC20(address,uint256)": FunctionFragment;
    "stakeERC721(address,uint256)": FunctionFragment;
    "stakedERC20Amount(address,address)": FunctionFragment;
    "stakingPower(address,address)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unstakeERC20(address,uint256)": FunctionFragment;
    "unstakeERC721(address,uint256)": FunctionFragment;
    "upgradeTo(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
    "version()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "__Staking_init",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [BytesLike]
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
    functionFragment: "isStakedERC721",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [string, string, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pastStakingPower",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
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
  encodeFunctionData(
    functionFragment: "stakeERC20",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeERC721",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakedERC20Amount",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "stakingPower",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "unstakeERC20",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "unstakeERC721",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "upgradeTo", values: [string]): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [string, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__Staking_init",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isStakedERC721",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pastStakingPower",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stakeERC20", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakeERC721",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "stakedERC20Amount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "stakingPower",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unstakeERC20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unstakeERC721",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {
    "AdminChanged(address,address)": EventFragment;
    "BeaconUpgraded(address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Paused(address)": EventFragment;
    "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
    "RoleGranted(bytes32,address,address)": EventFragment;
    "RoleRevoked(bytes32,address,address)": EventFragment;
    "StakedERC20(address,address,uint256,uint256)": EventFragment;
    "StakedERC721(address,address,uint256)": EventFragment;
    "StakingPowerChanged(address,address,uint256,uint256)": EventFragment;
    "Unpaused(address)": EventFragment;
    "UnstakedERC20(address,address,uint256,uint256)": EventFragment;
    "UnstakedERC721(address,address,uint256)": EventFragment;
    "Upgraded(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BeaconUpgraded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleGranted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleRevoked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StakedERC20"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StakedERC721"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "StakingPowerChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UnstakedERC20"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UnstakedERC721"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}

export type AdminChangedEvent = TypedEvent<
  [string, string],
  { previousAdmin: string; newAdmin: string }
>;

export type AdminChangedEventFilter = TypedEventFilter<AdminChangedEvent>;

export type BeaconUpgradedEvent = TypedEvent<[string], { beacon: string }>;

export type BeaconUpgradedEventFilter = TypedEventFilter<BeaconUpgradedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type PausedEvent = TypedEvent<[string], { account: string }>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

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

export type StakedERC20Event = TypedEvent<
  [string, string, BigNumber, BigNumber],
  { _user: string; _token: string; _decimals: BigNumber; _amount: BigNumber }
>;

export type StakedERC20EventFilter = TypedEventFilter<StakedERC20Event>;

export type StakedERC721Event = TypedEvent<
  [string, string, BigNumber],
  { _user: string; _token: string; _tokenId: BigNumber }
>;

export type StakedERC721EventFilter = TypedEventFilter<StakedERC721Event>;

export type StakingPowerChangedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  {
    _delegate: string;
    _token: string;
    _oldValue: BigNumber;
    _newValue: BigNumber;
  }
>;

export type StakingPowerChangedEventFilter =
  TypedEventFilter<StakingPowerChangedEvent>;

export type UnpausedEvent = TypedEvent<[string], { account: string }>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export type UnstakedERC20Event = TypedEvent<
  [string, string, BigNumber, BigNumber],
  { _user: string; _token: string; _decimals: BigNumber; _amount: BigNumber }
>;

export type UnstakedERC20EventFilter = TypedEventFilter<UnstakedERC20Event>;

export type UnstakedERC721Event = TypedEvent<
  [string, string, BigNumber],
  { _user: string; _token: string; _tokenId: BigNumber }
>;

export type UnstakedERC721EventFilter = TypedEventFilter<UnstakedERC721Event>;

export type UpgradedEvent = TypedEvent<[string], { implementation: string }>;

export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;

export interface Staking extends BaseContract {
  contractName: "Staking";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: StakingInterface;

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

    __Staking_init(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<[string]>;

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

    isStakedERC721(
      _user: string,
      _token: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pastStakingPower(
      _user: string,
      _token: string,
      _blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

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

    stakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stakeERC721(
      _token: string,
      _tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stakedERC20Amount(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    stakingPower(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unstakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unstakeERC721(
      _token: string,
      _tokenId: BigNumberish,
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
  };

  DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  __Staking_init(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<string>;

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

  isStakedERC721(
    _user: string,
    _token: string,
    _tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  onERC721Received(
    arg0: string,
    arg1: string,
    arg2: BigNumberish,
    arg3: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  pastStakingPower(
    _user: string,
    _token: string,
    _blockNumber: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  paused(overrides?: CallOverrides): Promise<boolean>;

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

  stakeERC20(
    _token: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stakeERC721(
    _token: string,
    _tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stakedERC20Amount(
    _user: string,
    _token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  stakingPower(
    _user: string,
    _token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unstakeERC20(
    _token: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unstakeERC721(
    _token: string,
    _tokenId: BigNumberish,
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

  callStatic: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    __Staking_init(overrides?: CallOverrides): Promise<void>;

    getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<string>;

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

    isStakedERC721(
      _user: string,
      _token: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    pastStakingPower(
      _user: string,
      _token: string,
      _blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<boolean>;

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

    stakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    stakeERC721(
      _token: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    stakedERC20Amount(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stakingPower(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    unstakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    unstakeERC721(
      _token: string,
      _tokenId: BigNumberish,
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

    "StakedERC20(address,address,uint256,uint256)"(
      _user?: string | null,
      _token?: string | null,
      _decimals?: BigNumberish | null,
      _amount?: null
    ): StakedERC20EventFilter;
    StakedERC20(
      _user?: string | null,
      _token?: string | null,
      _decimals?: BigNumberish | null,
      _amount?: null
    ): StakedERC20EventFilter;

    "StakedERC721(address,address,uint256)"(
      _user?: string | null,
      _token?: string | null,
      _tokenId?: BigNumberish | null
    ): StakedERC721EventFilter;
    StakedERC721(
      _user?: string | null,
      _token?: string | null,
      _tokenId?: BigNumberish | null
    ): StakedERC721EventFilter;

    "StakingPowerChanged(address,address,uint256,uint256)"(
      _delegate?: string | null,
      _token?: string | null,
      _oldValue?: null,
      _newValue?: null
    ): StakingPowerChangedEventFilter;
    StakingPowerChanged(
      _delegate?: string | null,
      _token?: string | null,
      _oldValue?: null,
      _newValue?: null
    ): StakingPowerChangedEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;

    "UnstakedERC20(address,address,uint256,uint256)"(
      _user?: string | null,
      _token?: string | null,
      _decimals?: BigNumberish | null,
      _amount?: null
    ): UnstakedERC20EventFilter;
    UnstakedERC20(
      _user?: string | null,
      _token?: string | null,
      _decimals?: BigNumberish | null,
      _amount?: null
    ): UnstakedERC20EventFilter;

    "UnstakedERC721(address,address,uint256)"(
      _user?: string | null,
      _token?: string | null,
      _tokenId?: BigNumberish | null
    ): UnstakedERC721EventFilter;
    UnstakedERC721(
      _user?: string | null,
      _token?: string | null,
      _tokenId?: BigNumberish | null
    ): UnstakedERC721EventFilter;

    "Upgraded(address)"(implementation?: string | null): UpgradedEventFilter;
    Upgraded(implementation?: string | null): UpgradedEventFilter;
  };

  estimateGas: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    __Staking_init(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getRoleAdmin(
      role: BytesLike,
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

    isStakedERC721(
      _user: string,
      _token: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pastStakingPower(
      _user: string,
      _token: string,
      _blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

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

    stakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stakeERC721(
      _token: string,
      _tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stakedERC20Amount(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stakingPower(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unstakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unstakeERC721(
      _token: string,
      _tokenId: BigNumberish,
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
  };

  populateTransaction: {
    DEFAULT_ADMIN_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    __Staking_init(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getRoleAdmin(
      role: BytesLike,
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

    isStakedERC721(
      _user: string,
      _token: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    onERC721Received(
      arg0: string,
      arg1: string,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pastStakingPower(
      _user: string,
      _token: string,
      _blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

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

    stakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stakeERC721(
      _token: string,
      _tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stakedERC20Amount(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stakingPower(
      _user: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unstakeERC20(
      _token: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unstakeERC721(
      _token: string,
      _tokenId: BigNumberish,
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
  };
}