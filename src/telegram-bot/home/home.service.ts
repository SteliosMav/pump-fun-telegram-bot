import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toPublicKey } from "../../core/solana";
import { BotSessionData } from "../bot.context";
import { BumpStatus } from "./types";

@Injectable()
export class HomeService {
  constructor(private readonly solanaService: SolanaService) {}

  getBalance(publicKey: string): Promise<number> {
    return this.solanaService.getBalance(toPublicKey(publicKey));
  }

  async bump(session: BotSessionData): Promise<void> {
    session.bumpStatus = BumpStatus.BUMPING;
    const { bumpSettings: settings } = session.user;

    // === Start Interval ===
    // ...

    // === Update User ===
    // ...
  }
}
