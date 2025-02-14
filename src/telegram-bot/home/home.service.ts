import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toPublicKey } from "../../core/solana";
import { BotSessionData } from "../bot.context";
import { delay } from "../../shared/utils";

@Injectable()
export class HomeService {
  constructor(private readonly solanaService: SolanaService) {}

  getBalance(publicKey: string): Promise<number> {
    return this.solanaService.getBalance(toPublicKey(publicKey));
  }

  async bump(session: BotSessionData, mint: string): Promise<void> {
    const { bumpingState: state } = session;
    const {
      limit,
      intervalInSeconds,
      amountInSol,
      slippage,
      priorityFeeInSol,
    } = session.user.bumpSettings;

    // === Start Interval ===
    state.startBumping();
    for (let i = 0; i < limit; i++) {
      if (state.shouldCancel) {
        break;
      }

      console.log(`Executing bump ${i + 1}/${limit}...`);

      try {
        // Bump
        await this.mockBump();
        state.incrementSuccess();

        if (i < limit - 1) {
          // Delay next iteration
          await delay(intervalInSeconds * 1000);
        }
      } catch (error) {
        // Error
        state.incrementFailure();
        if (state.isMaxFailedBumpsReached) {
          break;
        }
      }
    }

    // === Update User ===
    // Update user in database as well as on the session object based on the
    // response from the database.
    // ...
  }

  private mockBump(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
}
