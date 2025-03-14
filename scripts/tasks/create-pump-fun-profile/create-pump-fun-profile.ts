import { INestApplicationContext } from "@nestjs/common";
import { SolanaService } from "../../../src/core/solana/solana.service";
import { PumpFunService } from "../../../src/core/pump-fun/pump-fun.service";
import { toKeypair } from "../../../src/core/solana";

export async function createPumpFunProfileTask(
  appContext: INestApplicationContext
) {
  // Dependencies
  const solanaService = appContext.get(SolanaService);
  const pumpFunService = appContext.get(PumpFunService);

  // Create a new keypair
  const privateKey = solanaService.createPrivateKey();
  const keypair = toKeypair(privateKey);

  // Create a pump.fun profile
  const res = await pumpFunService.createProfile(keypair);

  console.log(res);
  console.log(`Private key: ${privateKey}`);
  console.log(`Public key: ${keypair.publicKey.toBase58()}`);
}
