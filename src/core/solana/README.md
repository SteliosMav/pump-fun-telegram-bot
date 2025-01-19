### Buffer Layouts

Structures that serialize and de-serialize buffers from and to javascript objects.

### Solana RPC Provider

Selects the RPC provider to use for interacting with the Solana block-chain. Free RPC provider plans have rate limit for example: Helius 15 request per second, QuickNode 10 requests per second etc.
The rotator option rotates between multiple providers so in the end you end up with 25 requests per second.

### Solana Service

It's supposed to be the only way for other modules to interact with the Solana's network. Should be generic so that it's reusable from different modules with mehtods such as: "transfer", "getBalance", "buy", "sell", "bump etc.

### Bonding Curve

A bonding curve is a mathematical relationship that defines token pricing as a function of supply. It provides liquidity and ensures token price stability:
**Virtual Token Reserves:** Tracks the total token supply available for the bonding curve.
**Virtual SOL Reserves:** Tracks the SOL reserves backing the token supply.
**Rent:** Ensures associated accounts maintain a minimum balance to prevent eviction from the blockchain.

### Jito Tip Fees

Supports integration with Jito Labs for MEV optimizations. Transactions can include a validator tip to incentivize fast inclusion in blocks.

### Liquidity Pool

Simulates a decentralized liquidity mechanism, enabling token swaps with predictable pricing and sufficient reserves.
