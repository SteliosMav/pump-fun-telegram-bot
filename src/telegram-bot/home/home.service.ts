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

  async startBumping(session: BotSessionData, mint: string): Promise<void> {
    const { bumpingState: state } = session;
    const {
      limit,
      intervalInSeconds,
      amountInSol,
      slippage,
      priorityFeeInSol,
    } = session.user.bumpSettings;

    // Start Interval
    state.started();
    for (let i = 1; i <= limit; i++) {
      // Cancel
      if (state.shouldCancel) {
        state.canceled();
        break;
      }

      try {
        // Perform bump
        await this.mockBump();
        state.incrementSuccess();

        // Delay next iteration
        const isLastIteration = i === limit;
        if (isLastIteration) {
          state.finished();
        } else {
          await delay(intervalInSeconds * 1000);
        }
      } catch (error) {
        // Error
        state.incrementFailure();
        if (state.isMaxFailedBumpsReached) {
          if (state.hasSuccessfulBumps) {
            state.cancelBy("MAX_FAILED_ATTEMPTS");
          } else {
            throw error;
          }
          break;
        }
      }
    }

    // Update user in database as well as on the session object based on the
    // response from the database.
    // ...
  }

  private mockBump(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
}
