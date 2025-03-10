import { PumpFunService } from "../../../core/pump-fun/pump-fun.service";
import { toKeypair } from "../../../core/solana";
import { SolanaService } from "../../../core/solana/solana.service";

export async function testPumpFunProfileUpdate(
  solanaService: SolanaService,
  pumpFunService: PumpFunService
): Promise<string> {
  const privateKey = solanaService.createPrivateKey();
  const keypair = toKeypair(privateKey);
  const response = await pumpFunService.createProfile(keypair);
  console.log(response);
  const responseMsg = `
*Public Key:*  \`${keypair.publicKey.toString()}\`
*Private Key:*  \`${privateKey}\`
`;
  return responseMsg;
}
