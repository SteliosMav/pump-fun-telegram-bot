import dotenv from "dotenv";
dotenv.config();

import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { PumpFunService } from "../../src/pump-fun/pump-fun.service";
import { ADMIN_KEYPAIR, HELIUS_API_STANDARD } from "../../src/solana/config";
import { SolanaService } from "../../src/solana/solana.service";
import { TEST_MINT_ACCOUNT } from "../../src/solana/constants";
import { SANDBOX_ACCOUNTS } from "./accounts";

const connection = new Connection(HELIUS_API_STANDARD, "confirmed");
const pumpFunService = new PumpFunService();
const solanaService = new SolanaService(connection, pumpFunService);
const [account1, account2] = SANDBOX_ACCOUNTS;

(async () => {
  const mint = new PublicKey("3AhvoZ9g7waFkVVz56fBGwPSqTt3jtkkGFHCXQnupump");
  const res2 = await solanaService.getBondingCurve(mint);

  process.exit();
})();
