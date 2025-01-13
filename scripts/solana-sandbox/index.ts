import dotenv from "dotenv";
dotenv.config();

import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { PumpFunService } from "../../src/pump-fun/pump-fun.service";
import { ADMIN_KEYPAIR, HELIUS_API_STANDARD } from "../../src/solana/config";
import { SolanaService } from "../../src/solana/solana.service";
import { TEST_MINT_ACCOUNT } from "../../src/solana/constants";
import { SANDBOX_ACCOUNTS } from "./accounts";

const connection = new Connection(HELIUS_API_STANDARD, "confirmed");
const pumpFunService = new PumpFunService();
const solanaService = new SolanaService(connection);
const [account1, account2] = SANDBOX_ACCOUNTS;

(async () => {
  // const txBuilder = new Transaction();

  // const { blockhash } = await connection.getLatestBlockhash("confirmed");
  // txBuilder.recentBlockhash = blockhash;

  // txBuilder.sign(ADMIN_KEYPAIR);

  // // const res1 = await sendTxUsingJito(txBuilder.serialize());
  // const res1 = await sendTxUsingJitoBundles([txBuilder.serialize()]);

  // const res2 = await getBundleStatus(
  //   "6dFt6hQXkuWD9dJXFFTmpCNEcyjayXj5xy2U4iXwwPLHHnMk3zjt7h9YBhc7i2oaWgDX15vWbindSvsQfUdVxDU"
  // );

  // await solanaService.test();

  // const associatedToken = await solanaService.getAssociatedToken(
  //   TEST_MINT_ACCOUNT,
  //   ADMIN_KEYPAIR.publicKey
  // );
  // if (associatedToken.exists) {
  //   const bumpRes = await solanaService.bump({
  //     mint: TEST_MINT_ACCOUNT,
  //     payer: ADMIN_KEYPAIR,
  //     createAssociatedTokenAccount: false,
  //     includeBotFee: false,
  //     amount: 0.0123 * LAMPORTS_PER_SOL,
  //     slippage: 0.02,
  //     priorityFee: 0.00005 * LAMPORTS_PER_SOL,
  //     associatedTokenAccount: associatedToken.account,
  //   });
  //   console.log(bumpRes);
  // }

  process.exit();
})();
