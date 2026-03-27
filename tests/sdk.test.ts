import { STACKS_TESTNET } from '@stacks/network';
import { uintCV } from '@stacks/transactions';
import { describe, expect, it } from 'vitest';

import { DEFAULT_DEPLOYER, StacksClickerSDK } from '../src/index.js';

describe('StacksClickerSDK', () => {
  it('builds a click payload with default network and deployer', () => {
    const sdk = new StacksClickerSDK();

    expect(sdk.click()).toEqual({
      contractAddress: DEFAULT_DEPLOYER,
      contractName: 'clicker-v2p',
      functionName: 'click',
      functionArgs: [],
      network: 'mainnet',
    });
  });

  it('supports custom deployer, network, and contract names', () => {
    const sdk = new StacksClickerSDK({
      deployerAddress: 'STTESTCUSTOMDEPLOYER',
      network: 'testnet',
      contracts: {
        clicker: 'clicker-v99',
      },
    });

    const payload = sdk.multiClick(12);

    expect(payload.contractAddress).toBe('STTESTCUSTOMDEPLOYER');
    expect(payload.contractName).toBe('clicker-v99');
    expect(payload.network).toBe('testnet');
    expect(payload.functionArgs).toEqual([{ type: 'uint128', value: '12' }]);
  });

  it('builds stacks contract-call options with typed Clarity values', () => {
    const sdk = new StacksClickerSDK({
      network: 'testnet',
    });

    const payload = sdk.voteCall(1, 2);

    expect(payload.contractAddress).toBe(DEFAULT_DEPLOYER);
    expect(payload.contractName).toBe('quickpoll-v2p');
    expect(payload.functionName).toBe('vote');
    expect(payload.functionArgs).toEqual([uintCV(1n), uintCV(2n)]);
    expect(payload.network).toBe(STACKS_TESTNET);
    expect(sdk.stacksNetwork).toBe(STACKS_TESTNET);
  });

  it('accepts bigint arguments and preserves precision', () => {
    const sdk = new StacksClickerSDK();

    const tipAmount = 12345678901234567890n;
    const payload = sdk.tip(tipAmount);

    expect(payload.functionArgs[0]).toEqual({ type: 'uint128', value: tipAmount.toString() });
  });

  it('throws on negative unsigned values', () => {
    const sdk = new StacksClickerSDK();

    expect(() => sdk.tip(-1)).toThrow(/unsigned integer/i);
  });

  it('throws on malformed string integers', () => {
    const sdk = new StacksClickerSDK();

    expect(() => sdk.vote('12.5', '1')).toThrow(/unsigned integer string/i);
  });

  it('throws when value exceeds uint128 range', () => {
    const sdk = new StacksClickerSDK();

    const tooLarge = (1n << 128n).toString();
    expect(() => sdk.multiClick(tooLarge)).toThrow(/exceeds uint128 range/i);
  });
});
