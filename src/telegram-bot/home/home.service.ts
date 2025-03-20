import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toKeypair, toLamports, toPublicKey } from "../../core/solana";
import { BotSessionData } from "../bot.context";
import { delay } from "../../shared/utils";
import { UserService } from "../../core/user/user.service";
import { getUserNotFoundForUpdateMsg } from "../../shared/error-messages";
import { PublicKey } from "@solana/web3.js";

@Injectable()
export class HomeService {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly userService: UserService
  ) {}

  getBalance(publicKey: PublicKey): Promise<number> {
    return this.solanaService.getBalance(publicKey);
  }

  async unmarkUserWhoBannedBot(session: BotSessionData): Promise<void> {
    const telegramId = session.user.telegram.id;

    const updatedUser = await this.userService.unmarkUserWhoBannedBot(
      telegramId
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
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
    const mintAccount = toPublicKey(mint);
    const payerKeyPair = toKeypair(session.user.getPrivateKey());

    // Start Interval
    state.started();

    // Get associated token
    const associatedToken = await this.solanaService.getAssociatedToken(
      mintAccount,
      payerKeyPair.publicKey
    );

    for (let i = 1; i <= limit; i++) {
      // Cancel
      if (state.shouldCancel) {
        state.canceled();
        break;
      }

      try {
        // Perform bump
        await this.solanaService.bump({
          mint: mintAccount,
          amount: toLamports(amountInSol),
          slippage,
          priorityFee: toLamports(priorityFeeInSol),
          payer: payerKeyPair,
          includeBotFee: !session.user.hasPassFor(mint),
          associatedTokenAccount: associatedToken.account,
          createAssociatedTokenAccount: !associatedToken.exists,
        });
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
