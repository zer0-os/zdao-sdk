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
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export declare namespace IZDAORegistry {
  export type ZDAORecordStruct = {
    id: BigNumberish;
    ensSpace: string;
    gnosisSafe: string;
    associatedzNAs: BigNumberish[];
  };

  export type ZDAORecordStructOutput = [
    BigNumber,
    string,
    string,
    BigNumber[]
  ] & {
    id: BigNumber;
    ensSpace: string;
    gnosisSafe: string;
    associatedzNAs: BigNumber[];
  };
}

export interface ZDAORegistryInterface extends utils.Interface {
  contractName: "ZDAORegistry";
  functions: {
    "addNewDAO(string,address)": FunctionFragment;
    "addZNAAssociation(uint256,uint256)": FunctionFragment;
    "doeszDAOExistForzNA(uint256)": FunctionFragment;
    "getzDAOByEns(string)": FunctionFragment;
    "getzDAOById(uint256)": FunctionFragment;
    "getzDaoByZNA(uint256)": FunctionFragment;
    "initialize(address)": FunctionFragment;
    "listzDAOs(uint256,uint256)": FunctionFragment;
    "numberOfzDAOs()": FunctionFragment;
    "owner()": FunctionFragment;
    "removeZNAAssociation(uint256,uint256)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setZNSHub(address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "zDAORecords(uint256)": FunctionFragment;
    "znsHub()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addNewDAO",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "addZNAAssociation",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "doeszDAOExistForzNA",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getzDAOByEns",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getzDAOById",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getzDaoByZNA",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "initialize", values: [string]): string;
  encodeFunctionData(
    functionFragment: "listzDAOs",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "numberOfzDAOs",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeZNAAssociation",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "setZNSHub", values: [string]): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "zDAORecords",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "znsHub", values?: undefined): string;

  decodeFunctionResult(functionFragment: "addNewDAO", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "addZNAAssociation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "doeszDAOExistForzNA",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getzDAOByEns",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getzDAOById",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getzDaoByZNA",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "listzDAOs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "numberOfzDAOs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeZNAAssociation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setZNSHub", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "zDAORecords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "znsHub", data: BytesLike): Result;

  events: {
    "DAOCreated(uint256,string,address)": EventFragment;
    "LinkAdded(uint256,uint256)": EventFragment;
    "LinkRemoved(uint256,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DAOCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LinkAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LinkRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export type DAOCreatedEvent = TypedEvent<
  [BigNumber, string, string],
  { daoId: BigNumber; ensSpace: string; gnosisSafe: string }
>;

export type DAOCreatedEventFilter = TypedEventFilter<DAOCreatedEvent>;

export type LinkAddedEvent = TypedEvent<
  [BigNumber, BigNumber],
  { daoId: BigNumber; zNA: BigNumber }
>;

export type LinkAddedEventFilter = TypedEventFilter<LinkAddedEvent>;

export type LinkRemovedEvent = TypedEvent<
  [BigNumber, BigNumber],
  { daoId: BigNumber; zNA: BigNumber }
>;

export type LinkRemovedEventFilter = TypedEventFilter<LinkRemovedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface ZDAORegistry extends BaseContract {
  contractName: "ZDAORegistry";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ZDAORegistryInterface;

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
    addNewDAO(
      ensSpace: string,
      gnosisSafe: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    addZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    doeszDAOExistForzNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getzDAOByEns(
      ensSpace: string,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput]>;

    getzDAOById(
      daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput]>;

    getzDaoByZNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput]>;

    initialize(
      _znsHub: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput[]]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    removeZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setZNSHub(
      _znsHub: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    zDAORecords(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string] & {
        id: BigNumber;
        ensSpace: string;
        gnosisSafe: string;
      }
    >;

    znsHub(overrides?: CallOverrides): Promise<[string]>;
  };

  addNewDAO(
    ensSpace: string,
    gnosisSafe: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  addZNAAssociation(
    daoId: BigNumberish,
    zNA: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  doeszDAOExistForzNA(
    zNA: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  getzDAOByEns(
    ensSpace: string,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

  getzDAOById(
    daoId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

  getzDaoByZNA(
    zNA: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

  initialize(
    _znsHub: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  listzDAOs(
    startIndex: BigNumberish,
    endIndex: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput[]>;

  numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  removeZNAAssociation(
    daoId: BigNumberish,
    zNA: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setZNSHub(
    _znsHub: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  zDAORecords(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, string, string] & {
      id: BigNumber;
      ensSpace: string;
      gnosisSafe: string;
    }
  >;

  znsHub(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    addNewDAO(
      ensSpace: string,
      gnosisSafe: string,
      overrides?: CallOverrides
    ): Promise<void>;

    addZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    doeszDAOExistForzNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getzDAOByEns(
      ensSpace: string,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

    getzDAOById(
      daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

    getzDaoByZNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

    initialize(_znsHub: string, overrides?: CallOverrides): Promise<void>;

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput[]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    removeZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setZNSHub(_znsHub: string, overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    zDAORecords(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string] & {
        id: BigNumber;
        ensSpace: string;
        gnosisSafe: string;
      }
    >;

    znsHub(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "DAOCreated(uint256,string,address)"(
      daoId?: BigNumberish | null,
      ensSpace?: null,
      gnosisSafe?: null
    ): DAOCreatedEventFilter;
    DAOCreated(
      daoId?: BigNumberish | null,
      ensSpace?: null,
      gnosisSafe?: null
    ): DAOCreatedEventFilter;

    "LinkAdded(uint256,uint256)"(
      daoId?: BigNumberish | null,
      zNA?: BigNumberish | null
    ): LinkAddedEventFilter;
    LinkAdded(
      daoId?: BigNumberish | null,
      zNA?: BigNumberish | null
    ): LinkAddedEventFilter;

    "LinkRemoved(uint256,uint256)"(
      daoId?: BigNumberish | null,
      zNA?: BigNumberish | null
    ): LinkRemovedEventFilter;
    LinkRemoved(
      daoId?: BigNumberish | null,
      zNA?: BigNumberish | null
    ): LinkRemovedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    addNewDAO(
      ensSpace: string,
      gnosisSafe: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    addZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    doeszDAOExistForzNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getzDAOByEns(
      ensSpace: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getzDAOById(
      daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getzDaoByZNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _znsHub: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    removeZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setZNSHub(
      _znsHub: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    zDAORecords(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    znsHub(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    addNewDAO(
      ensSpace: string,
      gnosisSafe: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    addZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    doeszDAOExistForzNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getzDAOByEns(
      ensSpace: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getzDAOById(
      daoId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getzDaoByZNA(
      zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _znsHub: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeZNAAssociation(
      daoId: BigNumberish,
      zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setZNSHub(
      _znsHub: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    zDAORecords(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    znsHub(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
