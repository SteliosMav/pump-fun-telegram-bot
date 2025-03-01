import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toPublicKey } from "../../core/solana";
import { BotSessionData } from "../bot.context";
import { delay } from "../../shared/utils";
import { UserService } from "../../core/user/user.service";
import { getUserNotFoundForUpdateMsg } from "../../shared/error-messages";

@Injectable()
export class HomeService {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly userService: UserService
  ) {}

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

    // Update user
    await this.incrementBumps(session, state.successCount, mint);
  }

  private mockBump(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }

  private async incrementBumps(
    session: BotSessionData,
    amount: number,
    mintUsed: string
  ): Promise<void> {
    const telegramId = session.user.telegram.id;
    let context: "paid" | "servicePass" | { tokenPass: string } = "paid";

    if (session.user.hasServicePass) {
      context = "servicePass";
    } else if (session.user.usedTokenPasses.has(mintUsed)) {
      context = { tokenPass: mintUsed };
    }

    const updatedUser = await this.userService.incrementBumps(
      telegramId,
      amount,
      context
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }
}
