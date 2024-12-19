/**
 * @note If 429 error occurs, try https://faucet.solana.com
 */

import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { testAccounts } from "./test-accounts";
import { sleep } from "./utils";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Function to airdrop SOL to test accounts
(async () => {
  console.log("Funding test accounts...");

  for (const account of testAccounts) {
    try {
      const publicKey = new PublicKey(account.publicKey);
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        0.1 * LAMPORTS_PER_SOL // Add 1 SOL to each account
      );

      await connection.confirmTransaction(airdropSignature, "confirmed");
      console.log(`Funded Account: ${account.publicKey} with 1 SOL`);
      await sleep(1000);
    } catch (error) {
      console.error(`Failed to fund account: ${account.publicKey}`, error);
    }
  }

  console.log("Funding complete.");
})();
