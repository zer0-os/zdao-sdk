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
    platformType: BigNumberish;
    id: BigNumberish;
    zDAO: string;
    zDAOOwnedBy: string;
    gnosisSafe: string;
    destroyed: boolean;
    associatedzNAs: BigNumberish[];
  };

  export type ZDAORecordStructOutput = [
    BigNumber,
    BigNumber,
    string,
    string,
    string,
    boolean,
    BigNumber[]
  ] & {
    platformType: BigNumber;
    id: BigNumber;
    zDAO: string;
    zDAOOwnedBy: string;
    gnosisSafe: string;
    destroyed: boolean;
    associatedzNAs: BigNumber[];
  };
}

export interface IZDAORegistryInterface extends utils.Interface {
  contractName: "IZDAORegistry";
  functions: {
    "addNewZDAO(uint256,uint256,address,bytes)": FunctionFragment;
    "addZNAAssociation(uint256,uint256)": FunctionFragment;
    "doesZNAExistForZNA(uint256)": FunctionFragment;
    "getZDAOById(uint256)": FunctionFragment;
    "getZDAOByZNA(uint256)": FunctionFragment;
    "listZDAOs(uint256,uint256)": FunctionFragment;
    "numberOfzDAOs()": FunctionFragment;
    "removeZNAAssociation(uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addNewZDAO",
    values: [BigNumberish, BigNumberish, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "addZNAAssociation",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "doesZNAExistForZNA",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getZDAOById",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getZDAOByZNA",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listZDAOs",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "numberOfzDAOs",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeZNAAssociation",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "addNewZDAO", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "addZNAAssociation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "doesZNAExistForZNA",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getZDAOById",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getZDAOByZNA",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "listZDAOs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "numberOfzDAOs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeZNAAssociation",
    data: BytesLike
  ): Result;

  events: {
    "DAOCreated(uint256,uint256,address,address,address)": EventFragment;
    "DAODestroyed(uint256)": EventFragment;
    "DAOModified(uint256,address)": EventFragment;
    "LinkAdded(uint256,uint256)": EventFragment;
    "LinkRemoved(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DAOCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DAODestroyed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DAOModified"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LinkAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LinkRemoved"): EventFragment;
}

export type DAOCreatedEvent = TypedEvent<
  [BigNumber, BigNumber, string, string, string],
  {
    _platformType: BigNumber;
    _zDAOId: BigNumber;
    _gnosisSafe: string;
    _creator: string;
    _zDAO: string;
  }
>;

export type DAOCreatedEventFilter = TypedEventFilter<DAOCreatedEvent>;

export type DAODestroyedEvent = TypedEvent<[BigNumber], { _zDAOId: BigNumber }>;

export type DAODestroyedEventFilter = TypedEventFilter<DAODestroyedEvent>;

export type DAOModifiedEvent = TypedEvent<
  [BigNumber, string],
  { _zDAOId: BigNumber; _gnosisSafe: string }
>;

export type DAOModifiedEventFilter = TypedEventFilter<DAOModifiedEvent>;

export type LinkAddedEvent = TypedEvent<
  [BigNumber, BigNumber],
  { _zDAOId: BigNumber; _zNA: BigNumber }
>;

export type LinkAddedEventFilter = TypedEventFilter<LinkAddedEvent>;

export type LinkRemovedEvent = TypedEvent<
  [BigNumber, BigNumber],
  { _zDAOId: BigNumber; _zNA: BigNumber }
>;

export type LinkRemovedEventFilter = TypedEventFilter<LinkRemovedEvent>;

export interface IZDAORegistry extends BaseContract {
  contractName: "IZDAORegistry";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IZDAORegistryInterface;

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
    addNewZDAO(
      _platformType: BigNumberish,
      _zNA: BigNumberish,
      _gnosisSafe: string,
      _options: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    addZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    doesZNAExistForZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getZDAOById(
      _zDAOId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput]>;

    getZDAOByZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput]>;

    listZDAOs(
      _startIndex: BigNumberish,
      _count: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput[]]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<[BigNumber]>;

    removeZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addNewZDAO(
    _platformType: BigNumberish,
    _zNA: BigNumberish,
    _gnosisSafe: string,
    _options: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  addZNAAssociation(
    _zDAOId: BigNumberish,
    _zNA: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  doesZNAExistForZNA(
    _zNA: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  getZDAOById(
    _zDAOId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

  getZDAOByZNA(
    _zNA: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

  listZDAOs(
    _startIndex: BigNumberish,
    _count: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput[]>;

  numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

  removeZNAAssociation(
    _zDAOId: BigNumberish,
    _zNA: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addNewZDAO(
      _platformType: BigNumberish,
      _zNA: BigNumberish,
      _gnosisSafe: string,
      _options: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    addZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    doesZNAExistForZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getZDAOById(
      _zDAOId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

    getZDAOByZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput>;

    listZDAOs(
      _startIndex: BigNumberish,
      _count: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput[]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

    removeZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "DAOCreated(uint256,uint256,address,address,address)"(
      _platformType?: BigNumberish | null,
      _zDAOId?: BigNumberish | null,
      _gnosisSafe?: string | null,
      _creator?: null,
      _zDAO?: null
    ): DAOCreatedEventFilter;
    DAOCreated(
      _platformType?: BigNumberish | null,
      _zDAOId?: BigNumberish | null,
      _gnosisSafe?: string | null,
      _creator?: null,
      _zDAO?: null
    ): DAOCreatedEventFilter;

    "DAODestroyed(uint256)"(
      _zDAOId?: BigNumberish | null
    ): DAODestroyedEventFilter;
    DAODestroyed(_zDAOId?: BigNumberish | null): DAODestroyedEventFilter;

    "DAOModified(uint256,address)"(
      _zDAOId?: BigNumberish | null,
      _gnosisSafe?: string | null
    ): DAOModifiedEventFilter;
    DAOModified(
      _zDAOId?: BigNumberish | null,
      _gnosisSafe?: string | null
    ): DAOModifiedEventFilter;

    "LinkAdded(uint256,uint256)"(
      _zDAOId?: BigNumberish | null,
      _zNA?: BigNumberish | null
    ): LinkAddedEventFilter;
    LinkAdded(
      _zDAOId?: BigNumberish | null,
      _zNA?: BigNumberish | null
    ): LinkAddedEventFilter;

    "LinkRemoved(uint256,uint256)"(
      _zDAOId?: BigNumberish | null,
      _zNA?: BigNumberish | null
    ): LinkRemovedEventFilter;
    LinkRemoved(
      _zDAOId?: BigNumberish | null,
      _zNA?: BigNumberish | null
    ): LinkRemovedEventFilter;
  };

  estimateGas: {
    addNewZDAO(
      _platformType: BigNumberish,
      _zNA: BigNumberish,
      _gnosisSafe: string,
      _options: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    addZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    doesZNAExistForZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getZDAOById(
      _zDAOId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getZDAOByZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listZDAOs(
      _startIndex: BigNumberish,
      _count: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

    removeZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addNewZDAO(
      _platformType: BigNumberish,
      _zNA: BigNumberish,
      _gnosisSafe: string,
      _options: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    addZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    doesZNAExistForZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getZDAOById(
      _zDAOId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getZDAOByZNA(
      _zNA: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listZDAOs(
      _startIndex: BigNumberish,
      _count: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeZNAAssociation(
      _zDAOId: BigNumberish,
      _zNA: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
