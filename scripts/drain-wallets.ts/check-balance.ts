import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { testAccounts } from "./test-accounts";
import { sleep } from "./utils";
import { CONNECTION } from "./constants";

(async () => {
  console.log("Fetching balances for test accounts...");

  for (const account of testAccounts) {
    try {
      const publicKey = new PublicKey(account.publicKey);
      const balance = await CONNECTION.getBalance(publicKey, "confirmed");
      console.log(
        `Account: ${account.publicKey} - Balance: ${
          balance / LAMPORTS_PER_SOL
        } SOL`
      );
      await sleep(1000);
    } catch (error) {
      console.error(
        `Failed to fetch balance for account: ${account.publicKey}`,
        error
      );
    }
  }
})();
