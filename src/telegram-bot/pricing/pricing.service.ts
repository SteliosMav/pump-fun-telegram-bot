import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toKeypair, toLamports, toPublicKey } from "../../core/solana";
import {
  BOT_ACCOUNT,
  BOT_SERVICE_FEE_IN_SOL,
  BOT_SERVICE_PASS_PRICE_IN_SOL,
  BOT_TOKEN_PASS_PRICE_IN_SOL,
  SIGNATURE_FEE,
} from "../../shared/constants";
import { CalculateRequiredBalanceParams, Plan } from "./types";
import {
  BUY_PLAN_PRIORITY_FEE_IN_SOL,
  BUY_PLAN_VALIDATOR_TIP_IN_SOL,
} from "./constants";
import { UserService } from "../../core/user/user.service";
import { BotSessionData } from "../bot.context";
import { getUserNotFoundForUpdateMsg } from "../../shared/error-messages";
import { calculatePumpFunFee } from "../../core/pump-fun";
import { UserDoc } from "../../core/user/types";

@Injectable()
export class PricingService {
  private readonly includeTxFees: boolean = true;
  private readonly userJito: boolean = false;

  constructor(
    private readonly solanaService: SolanaService,
    private readonly userService: UserService
  ) {}

  getBalance(publicKey: string) {
    return this.solanaService.getBalance(toPublicKey(publicKey));
  }

  /**
   * Calculates the price per bump based on the user's plan (Service Pass, Token Pass, or Pay-Per-Bump).
   */
  calculateBumpPrice(user: UserDoc, mint?: string): number {
    const hasServicePass = user.hasServicePass;
    const hasTokenPass = mint && user.usedTokenPasses.has(mint);

    const serviceFee = hasServicePass
      ? 0
      : hasTokenPass
      ? 0
      : BOT_SERVICE_FEE_IN_SOL;

    const priorityFee = user.bumpSettings.priorityFee;
    const pumpFunFee = calculatePumpFunFee(user.bumpSettings.amount);
    const txFee = SIGNATURE_FEE / toLamports(1); // Convert lamports to SOL

    return toLamports(serviceFee + priorityFee + pumpFunFee + txFee);
  }

  /**
   * Calculates the total price of a plan
   */
  calculateRequiredBalanceFor(
    ...[plan, user, mint]: CalculateRequiredBalanceParams
  ): number {
    if (plan === "PAY_PER_BUMP") {
      const pricePerBump = this.calculateBumpPrice(user, mint);
      const amount = toLamports(user.bumpSettings.amount);
      const slippage =
        toLamports(user.bumpSettings.amount) * user.bumpSettings.slippage;

      return Math.floor(
        amount + slippage + pricePerBump * user.bumpSettings.limit
      );
    }

    const planPrice = this.getPriceFor(plan);
    const additionalFees = this.includeTxFees
      ? 0
      : SIGNATURE_FEE +
        toLamports(
          this.userJito
            ? BUY_PLAN_VALIDATOR_TIP_IN_SOL
            : BUY_PLAN_PRIORITY_FEE_IN_SOL
        );

    return planPrice + additionalFees;
  }

  buy(plan: Exclude<Plan, "PAY_PER_BUMP">, privateKey: string) {
    const totalPrice = this.calculateRequiredBalanceFor(plan);

    return this.solanaService.transfer({
      lamports: totalPrice,
      from: toKeypair(privateKey),
      to: BOT_ACCOUNT,
      validatorTip: toLamports(BUY_PLAN_VALIDATOR_TIP_IN_SOL),
    });
  }

  async addServicePass(session: BotSessionData): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.addServicePass(telegramId);

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  async incrementTokenPassesLeft(session: BotSessionData): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.incrementTokenPassesLeft(
      telegramId
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  async useTokenPass(session: BotSessionData, mint: string) {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.addUsedTokenPass(
      telegramId,
      mint
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  private getPriceFor(plan: Plan): number {
    return toLamports(
      plan === "TOKEN_PASS"
        ? BOT_TOKEN_PASS_PRICE_IN_SOL
        : BOT_SERVICE_PASS_PRICE_IN_SOL
    );
  }
}
