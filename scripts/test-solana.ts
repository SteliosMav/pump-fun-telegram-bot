import dotenv from "dotenv";
dotenv.config();
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { PumpFunService } from "../src/pump-fun/pump-fun.service";
import { ADMIN_KEYPAIR } from "../src/solana/config";
import { SolanaService } from "../src/solana/solana.service";
import { TEST_MINT_ACCOUNT } from "../src/solana/constants";

(async () => {
  console.log("Testing solana...");

  const pumpFunService = new PumpFunService();
  const solanaService = new SolanaService(pumpFunService);

  const response = await solanaService.bump({
    mint: TEST_MINT_ACCOUNT,
    payer: ADMIN_KEYPAIR,
    includeBotFee: false,
    amount: 0.0123 * LAMPORTS_PER_SOL,
    priorityFee: 0.0001 * LAMPORTS_PER_SOL,
    slippage: 0.02,
  });

  console.log("Response: ", response);

  process.exit();
})();
