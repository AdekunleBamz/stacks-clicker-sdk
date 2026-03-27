export const DEFAULT_DEPLOYER = 'SP5K2RHMSBH4PAP4PGX77MCVNK1ZEED07CWX9TJT';

export const NETWORKS = ['mainnet', 'testnet'] as const;

export type NetworkType = (typeof NETWORKS)[number];

export interface ContractNames {
  clicker: string;
  tipJar: string;
  quickPoll: string;
}

export const DEFAULT_CONTRACTS: Record<NetworkType, ContractNames> = {
  mainnet: {
    clicker: 'clicker-v2p',
    tipJar: 'tipjar-v2p',
    quickPoll: 'quickpoll-v2p',
  },
  testnet: {
    clicker: 'clicker-v2p',
    tipJar: 'tipjar-v2p',
    quickPoll: 'quickpoll-v2p',
  },
};

export function isNetworkType(value: unknown): value is NetworkType {
  return typeof value === 'string' && NETWORKS.includes(value as NetworkType);
}
