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
    const {
      limit,
      intervalInSeconds,
      amountInSol,
      slippage,
      priorityFeeInSol,
    } = session.user.bumpSettings;

    // === Start Interval ===
    // A while look can be set here that sends requests without waiting for
    // the previous request's response. If an error or two occurres in one of the
    // requests, a boolean should be set that would prevent the loop from going on.
    // Also that boolean should be affected from any user's interaction as well,
    // that would cancel the bot's bumping.
    // ...

    // === Update User ===
    // Update user in database as well as on the session object based on the
    // response from the database.
    // ...
  }
}
