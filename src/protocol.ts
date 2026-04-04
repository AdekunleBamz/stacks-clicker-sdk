import { DEFAULT_CONTRACTS, DEFAULT_DEPLOYER, isNetworkType, type NetworkType } from './constants.js';
import { validateStacksAddress } from './utils.js';

export interface StacksAddress {
  address: string;
  network: NetworkType;
  isValid: boolean;
}

export interface ClickerConfig {
  contractAddress: string;
  contractName: string;
  network: NetworkType;
}

export const PROTOCOL_VERSION = '1.1.0';

export const DEFAULT_PROTOCOL_CONFIG: Readonly<ClickerConfig> = Object.freeze({
  contractAddress: DEFAULT_DEPLOYER,
  contractName: DEFAULT_CONTRACTS.mainnet.clicker,
  network: 'mainnet',
});

let protocolConfig: ClickerConfig = { ...DEFAULT_PROTOCOL_CONFIG };

export function initializeProtocol(
  options: Partial<ClickerConfig> = {},
): ClickerConfig & { version: string } {
  protocolConfig = normalizeClickerConfig(options);
  return getProtocolConfig();
}

export function getProtocolVersion(): string {
  return PROTOCOL_VERSION;
}

export function getProtocolConfig(): ClickerConfig & { version: string } {
  return {
    ...protocolConfig,
    version: PROTOCOL_VERSION,
  };
}

export function createStacksAddress(
  address: string,
  network: NetworkType = 'mainnet',
): StacksAddress {
  const normalized = typeof address === 'string' ? address.trim().toUpperCase() : '';

  return {
    address: normalized,
    network,
    isValid: validateStacksAddress(normalized),
  };
}

export function normalizeClickerConfig(config: Partial<ClickerConfig> = {}): ClickerConfig {
  const network = config.network && isNetworkType(config.network) ? config.network : 'mainnet';

  return {
    contractAddress:
      typeof config.contractAddress === 'string' && config.contractAddress.trim().length > 0
        ? config.contractAddress.trim()
        : DEFAULT_DEPLOYER,
    contractName:
      typeof config.contractName === 'string' && config.contractName.trim().length > 0
        ? config.contractName.trim()
        : DEFAULT_CONTRACTS[network].clicker,
    network,
  };
}
