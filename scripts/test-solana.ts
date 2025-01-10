import dotenv from "dotenv";
dotenv.config();

import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PumpFunService } from "../src/pump-fun/pump-fun.service";
import { ADMIN_KEYPAIR, HELIUS_API_STANDARD } from "../src/solana/config";
import { SolanaService } from "../src/solana/solana.service";
import { TEST_MINT_ACCOUNT } from "../src/solana/constants";

(async () => {
  const connection = new Connection(HELIUS_API_STANDARD, "confirmed");
  const pumpFunService = new PumpFunService();
  const solanaService = new SolanaService(connection, pumpFunService);

  const response = await solanaService.bump({
    mint: TEST_MINT_ACCOUNT,
    payer: ADMIN_KEYPAIR,
    includeBotFee: false,
    amount: 0.0123 * LAMPORTS_PER_SOL,
    priorityFee: 0.0001 * LAMPORTS_PER_SOL,
    slippage: 0.02,
  });

  console.log("Bump response: ", response);

  process.exit();
})();
