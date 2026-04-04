import { describe, expect, it } from 'vitest';

import {
  createStacksAddress,
  formatAddress,
  getProtocolConfig,
  initializeProtocol,
  validateStacksAddress,
} from '../src/index.js';

describe('StacksClicker helper exports', () => {
  it('formats addresses for compact display', () => {
    expect(formatAddress('SP3FKNZSNM0JJ8Y1Q3S3C6PJR0F3PZ4SVCGG6N')).toBe('SP3FKN...GG6N');
  });

  it('validates stacks addresses', () => {
    expect(validateStacksAddress('SP3FKNZSNM0JJ8Y1Q3S3C6PJR0F3PZ4SVCGG6N')).toBe(true);
    expect(validateStacksAddress('not-an-address')).toBe(false);
  });

  it('stores protocol configuration through initializeProtocol', () => {
    const protocol = initializeProtocol({
      contractAddress: 'SPTESTCUSTOMADDRESS0000000000000000000000',
      contractName: 'clicker-v3',
      network: 'testnet',
    });

    expect(protocol).toEqual({
      contractAddress: 'SPTESTCUSTOMADDRESS0000000000000000000000',
      contractName: 'clicker-v3',
      network: 'testnet',
      version: '1.1.0',
    });

    expect(getProtocolConfig()).toEqual(protocol);
  });

  it('creates typed stacks address metadata', () => {
    expect(
      createStacksAddress('SP3FKNZSNM0JJ8Y1Q3S3C6PJR0F3PZ4SVCGG6N', 'mainnet'),
    ).toEqual({
      address: 'SP3FKNZSNM0JJ8Y1Q3S3C6PJR0F3PZ4SVCGG6N',
      network: 'mainnet',
      isValid: true,
    });
  });
});
