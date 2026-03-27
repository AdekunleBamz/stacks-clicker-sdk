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

export interface ContractPayload {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityUintArg[];
  network: NetworkType;
}

export interface SDKOptions {
  deployerAddress?: string;
  network?: NetworkType;
  contracts?: Partial<ContractNames>;
}

export class StacksClickerSDK {
  public readonly deployer: string;
  public readonly network: NetworkType;
  public readonly contracts: ContractNames;

  constructor(options: SDKOptions = {}) {
    this.network = resolveNetwork(options.network);
    this.deployer = resolveDeployer(options.deployerAddress);
    this.contracts = {
      ...DEFAULT_CONTRACTS[this.network],
      ...sanitizeContractOverrides(options.contracts),
    };
  }

  public click(): ContractPayload {
    return this.buildPayload(this.contracts.clicker, 'click');
  }

  public multiClick(amount: UintLike): ContractPayload {
    return this.buildPayload(this.contracts.clicker, 'multi-click', [
      toUint128Arg(amount, 'amount'),
    ]);
  }

  public ping(): ContractPayload {
    return this.buildPayload(this.contracts.clicker, 'ping');
  }

  public tip(amountInUStx: UintLike): ContractPayload {
    return this.buildPayload(this.contracts.tipJar, 'tip', [
      toUint128Arg(amountInUStx, 'amountInUStx'),
    ]);
  }

  public withdrawTip(): ContractPayload {
    return this.buildPayload(this.contracts.tipJar, 'withdraw');
  }

  public vote(pollId: UintLike, optionId: UintLike): ContractPayload {
    return this.buildPayload(this.contracts.quickPoll, 'vote', [
      toUint128Arg(pollId, 'pollId'),
      toUint128Arg(optionId, 'optionId'),
    ]);
  }

  private buildPayload(
    contractName: string,
    functionName: string,
    functionArgs: ClarityUintArg[] = [],
  ): ContractPayload {
    return {
      contractAddress: this.deployer,
      contractName,
      functionName,
      functionArgs,
      network: this.network,
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

function toUint128Arg(value: UintLike, label: string): ClarityUintArg {
  const parsed = parseUint128(value, label);
  return {
    type: 'uint128',
    value: parsed.toString(),
  };
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
