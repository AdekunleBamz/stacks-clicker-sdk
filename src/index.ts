import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';
import { uintCV, type ClarityValue } from '@stacks/transactions';

import {
  DEFAULT_CONTRACTS,
  DEFAULT_DEPLOYER,
  type ContractNames,
  type NetworkType,
  isNetworkType,
} from './constants.js';

const UINT128_MAX = (1n << 128n) - 1n;

type UintLike = number | string | bigint;

interface ClarityUintArg {
  type: 'uint128';
  value: string;
}

interface UintInput {
  label: string;
  value: UintLike;
}

export interface ContractPayload {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityUintArg[];
  network: NetworkType;
}

export interface ContractCallPayload {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  network: StacksNetwork;
}

export interface SDKOptions {
  deployerAddress?: string;
  network?: NetworkType;
  contracts?: Partial<ContractNames>;
}

export class StacksClickerSDK {
  public readonly deployer: string;
  public readonly network: NetworkType;
  public readonly stacksNetwork: StacksNetwork;
  public readonly contracts: ContractNames;

  constructor(options: SDKOptions = {}) {
    this.network = resolveNetwork(options.network);
    this.stacksNetwork = resolveStacksNetwork(this.network);
    this.deployer = resolveDeployer(options.deployerAddress);
    this.contracts = {
      ...DEFAULT_CONTRACTS[this.network],
      ...sanitizeContractOverrides(options.contracts),
    };
  }

  public click(): ContractPayload {
    return this.buildRpcPayload(this.contracts.clicker, 'click');
  }

  public clickCall(): ContractCallPayload {
    return this.buildContractCallPayload(this.contracts.clicker, 'click');
  }

  public multiClick(amount: UintLike): ContractPayload {
    return this.buildRpcPayload(this.contracts.clicker, 'multi-click', [
      { label: 'amount', value: amount },
    ]);
  }

  public multiClickCall(amount: UintLike): ContractCallPayload {
    return this.buildContractCallPayload(this.contracts.clicker, 'multi-click', [
      { label: 'amount', value: amount },
    ]);
  }

  public ping(): ContractPayload {
    return this.buildRpcPayload(this.contracts.clicker, 'ping');
  }

  public pingCall(): ContractCallPayload {
    return this.buildContractCallPayload(this.contracts.clicker, 'ping');
  }

  public tip(amountInUStx: UintLike): ContractPayload {
    return this.buildRpcPayload(this.contracts.tipJar, 'tip', [
      {
        label: 'amountInUStx',
        value: amountInUStx,
      },
    ]);
  }

  public tipCall(amountInUStx: UintLike): ContractCallPayload {
    return this.buildContractCallPayload(this.contracts.tipJar, 'tip', [
      {
        label: 'amountInUStx',
        value: amountInUStx,
      },
    ]);
  }

  public withdrawTip(): ContractPayload {
    return this.buildRpcPayload(this.contracts.tipJar, 'withdraw');
  }

  public withdrawTipCall(): ContractCallPayload {
    return this.buildContractCallPayload(this.contracts.tipJar, 'withdraw');
  }

  public vote(pollId: UintLike, optionId: UintLike): ContractPayload {
    return this.buildRpcPayload(this.contracts.quickPoll, 'vote', [
      { label: 'pollId', value: pollId },
      { label: 'optionId', value: optionId },
    ]);
  }

  public voteCall(pollId: UintLike, optionId: UintLike): ContractCallPayload {
    return this.buildContractCallPayload(this.contracts.quickPoll, 'vote', [
      { label: 'pollId', value: pollId },
      { label: 'optionId', value: optionId },
    ]);
  }

  private buildRpcPayload(
    contractName: string,
    functionName: string,
    inputs: UintInput[] = [],
  ): ContractPayload {
    const parsed = parseUintInputs(inputs);

    return {
      contractAddress: this.deployer,
      contractName,
      functionName,
      functionArgs: parsed.map((value) => ({
        type: 'uint128',
        value: value.toString(),
      })),
      network: this.network,
    };
  }

  private buildContractCallPayload(
    contractName: string,
    functionName: string,
    inputs: UintInput[] = [],
  ): ContractCallPayload {
    const parsed = parseUintInputs(inputs);

    return {
      contractAddress: this.deployer,
      contractName,
      functionName,
      functionArgs: parsed.map((value) => uintCV(value)),
      network: this.stacksNetwork,
    };
  }
}

function resolveNetwork(network: SDKOptions['network']): NetworkType {
  const candidate = network ?? 'mainnet';
  if (!isNetworkType(candidate)) {
    throw new Error(`Invalid network "${String(candidate)}". Use "mainnet" or "testnet".`);
  }

  return candidate;
}

function resolveStacksNetwork(network: NetworkType): StacksNetwork {
  return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
}

function resolveDeployer(deployerAddress: SDKOptions['deployerAddress']): string {
  const candidate = (deployerAddress ?? DEFAULT_DEPLOYER).trim();
  if (candidate.length === 0) {
    throw new Error('deployerAddress cannot be empty.');
  }

  return candidate;
}

function sanitizeContractOverrides(contracts: SDKOptions['contracts']): Partial<ContractNames> {
  if (!contracts) {
    return {};
  }

  const validated: Partial<ContractNames> = {};

  for (const [key, value] of Object.entries(contracts)) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`contracts.${key} must be a non-empty string when provided.`);
    }

    if (key === 'clicker' || key === 'tipJar' || key === 'quickPoll') {
      validated[key] = value.trim();
    }
  }

  return validated;
}

function parseUintInputs(inputs: UintInput[]): bigint[] {
  return inputs.map((input) => parseUint128(input.value, input.label));
}

function parseUint128(value: UintLike, label: string): bigint {
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new Error(`${label} must be a safe integer when passed as a number.`);
    }

    if (value < 0) {
      throw new Error(`${label} must be an unsigned integer (>= 0).`);
    }

    return assertUint128Range(BigInt(value), label);
  }

  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new Error(`${label} must be an unsigned integer (>= 0).`);
    }

    return assertUint128Range(value, label);
  }

  if (typeof value === 'string') {
    if (!/^(0|[1-9]\d*)$/.test(value)) {
      throw new Error(`${label} must be a base-10 unsigned integer string.`);
    }

    return assertUint128Range(BigInt(value), label);
  }

  throw new Error(`${label} must be a number, bigint, or unsigned integer string.`);
}

function assertUint128Range(value: bigint, label: string): bigint {
  if (value > UINT128_MAX) {
    throw new Error(`${label} exceeds uint128 range.`);
  }

  return value;
}

export * from './constants.js';
