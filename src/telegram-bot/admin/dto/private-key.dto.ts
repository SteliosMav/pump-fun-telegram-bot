import { SolanaPrivateKey } from "../validators/solana-private-key.validator";

export class PrivateKeyDto {
  @SolanaPrivateKey()
  privateKey!: string;
}
