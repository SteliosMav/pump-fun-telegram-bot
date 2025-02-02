import { Injectable } from "@nestjs/common";
import { SolanaService } from "../../core/solana/solana.service";
import { toKeypair, toLamports, toPublicKey } from "../../core/solana";
import {
  BOT_ACCOUNT,
  BOT_SERVICE_PASS_PRICE_IN_SOL,
  BOT_TOKEN_PASS_PRICE_IN_SOL,
  SIGNATURE_FEE,
} from "../../shared/constants";
import { Plan } from "./types";
import {
  BUY_PLAN_PRIORITY_FEE_IN_SOL,
  BUY_PLAN_VALIDATOR_TIP_IN_SOL,
} from "./constants";
import { UserService } from "../../core/user/user.service";
import { BotSessionData } from "../bot.context";
import { getUserNotFoundForUpdateMsg } from "../../shared/error-messages";

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

  calculateFinalPriceFor(plan: Plan) {
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

  buy(plan: Plan, privateKey: string) {
    const totalPrice = this.calculateFinalPriceFor(plan);

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
