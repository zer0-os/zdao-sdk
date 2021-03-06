/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
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

export interface IZDAORegistryInterface extends utils.Interface {
  contractName: "IZDAORegistry";
  functions: {
    "doeszDAOExistForzNA(uint256)": FunctionFragment;
    "getzDAOByEns(string)": FunctionFragment;
    "getzDAOById(uint256)": FunctionFragment;
    "getzDaoByZNA(uint256)": FunctionFragment;
    "listzDAOs(uint256,uint256)": FunctionFragment;
    "numberOfzDAOs()": FunctionFragment;
  };

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
  encodeFunctionData(
    functionFragment: "listzDAOs",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "numberOfzDAOs",
    values?: undefined
  ): string;

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
  decodeFunctionResult(functionFragment: "listzDAOs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "numberOfzDAOs",
    data: BytesLike
  ): Result;

  events: {
    "DAOCreated(uint256,string,address)": EventFragment;
    "LinkAdded(uint256,uint256)": EventFragment;
    "LinkRemoved(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DAOCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LinkAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LinkRemoved"): EventFragment;
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

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[IZDAORegistry.ZDAORecordStructOutput[]]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

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

  listzDAOs(
    startIndex: BigNumberish,
    endIndex: BigNumberish,
    overrides?: CallOverrides
  ): Promise<IZDAORegistry.ZDAORecordStructOutput[]>;

  numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
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

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<IZDAORegistry.ZDAORecordStructOutput[]>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;
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
  };

  estimateGas: {
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

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
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

    listzDAOs(
      startIndex: BigNumberish,
      endIndex: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numberOfzDAOs(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
