import dotenv from "dotenv";
dotenv.config();

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PumpFunService } from "../../src/pump-fun/pump-fun.service";
import { ADMIN_KEYPAIR, HELIUS_API_STANDARD } from "../../src/solana/config";
import { SolanaService } from "../../src/solana/solana.service";
import { TEST_MINT_ACCOUNT } from "../../src/solana/constants";
import { SANDBOX_ACCOUNTS } from "./accounts";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const pumpFunService = new PumpFunService();
const solanaService = new SolanaService(connection, pumpFunService);
const [account1, account2] = SANDBOX_ACCOUNTS;

(async () => {
  await getBalance();

  await transfer();

  // const rent = await solanaService.getAssociatedTokenRent();

  // const associatedToken = await solanaService.getAssociatedToken(
  //   TEST_MINT_ACCOUNT,
  //   ADMIN_KEYPAIR.publicKey
  // );
  // const response = await solanaService.bump({
  //   mint: TEST_MINT_ACCOUNT,
  //   payer: ADMIN_KEYPAIR,
  //   includeBotFee: false,
  //   amount: 0.0123 * LAMPORTS_PER_SOL,
  //   priorityFee: 0.0001 * LAMPORTS_PER_SOL,
  //   slippage: 0.02,
  //   associatedTokenAccount: associatedToken.account,
  //   createAssociatedTokenAccount: !associatedToken.exists,
  // });

  // console.log("Bump response: ", response);

  process.exit();
})();

async function getBalance() {
  const balance1 = await solanaService.getBalance(account1.publicKey);
  const balance2 = await solanaService.getBalance(account2.publicKey);
  console.log(balance1, balance2);
}

async function transfer() {
  await getBalance();

  const amount = 0.01 * LAMPORTS_PER_SOL;
  const response = await solanaService.transfer(
    amount,
    account1,
    account2.publicKey
  );
  console.log(response);

  await getBalance();
}
