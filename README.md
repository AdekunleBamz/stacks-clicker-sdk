# Stacks Clicker SDK

A standalone, production-ready TypeScript SDK for building contract-call payloads for the Stacks Clicker ecosystem (`clicker`, `tipjar`, and `quickpoll`).

Runtime dependencies:

- `@stacks/transactions` for typed Clarity values (for contract-call args)
- `@stacks/network` for canonical Stacks network objects

## Install

```bash
npm install stacks-clicker-sdk
```

## Quick Start

```ts
import { StacksClickerSDK } from 'stacks-clicker-sdk';

const sdk = new StacksClickerSDK({
  network: 'mainnet',
  deployerAddress: 'SP5K2RHMSBH4PAP4PGX77MCVNK1ZEED07CWX9TJT',
});

const clickTx = sdk.multiClick(100);
const tipTx = sdk.tip('5000000');
const voteTx = sdk.vote(1, 2);
```

Each method returns a plain payload object that can be used with Stacks wallet providers such as WalletConnect or `@stacks/connect`.

### Typed Contract-Call Payloads

If you prefer native Stacks typed args/network objects, use the `*Call` methods:

```ts
import { StacksClickerSDK } from 'stacks-clicker-sdk';

const sdk = new StacksClickerSDK({ network: 'testnet' });
const callPayload = sdk.voteCall(1, 2);
// callPayload.functionArgs => ClarityValue[] from @stacks/transactions
// callPayload.network => StacksNetwork from @stacks/network
```

## API

`new StacksClickerSDK(options?)`

- `network`: `'mainnet' | 'testnet'` (defaults to `'mainnet'`)
- `deployerAddress`: contract deployer principal (defaults to SDK mainnet deployer)
- `contracts`: optional per-contract overrides (`clicker`, `tipJar`, `quickPoll`)

Methods:

- `click()`
- `clickCall()`
- `multiClick(amount)`
- `multiClickCall(amount)`
- `ping()`
- `pingCall()`
- `tip(amountInUStx)`
- `tipCall(amountInUStx)`
- `withdrawTip()`
- `withdrawTipCall()`
- `vote(pollId, optionId)`
- `voteCall(pollId, optionId)`

All numeric arguments accept `number`, `bigint`, or base-10 unsigned integer `string`, and are validated against `uint128` range.

## Development

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## License

MIT
