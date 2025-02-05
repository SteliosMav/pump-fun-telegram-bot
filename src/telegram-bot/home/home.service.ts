import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toPublicKey } from "../../core/solana";

@Injectable()
export class HomeService {
  constructor(private readonly solanaService: SolanaService) {}

  getBalance(publicKey: string) {
    return this.solanaService.getBalance(toPublicKey(publicKey));
  }

  bump(userId: number): Promise<string> {
    // Add database save logic here
    return new Promise((resolve) => {
      setTimeout(() => resolve("signature"), 4000);
    });
  }
}
