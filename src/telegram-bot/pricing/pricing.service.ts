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

@Injectable()
export class PricingService {
  private readonly isPriceInclusive: boolean = false;
  private readonly userJito: boolean = false;

  constructor(private readonly solanaService: SolanaService) {}

  getBalance(publicKey: string) {
    return this.solanaService.getBalance(toPublicKey(publicKey));
  }

  getMinBalanceFor(plan: Plan) {
    const planPrice = this.getPlanPrice(plan);
    const additionalFees = this.isPriceInclusive
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
    const totalPrice = this.getMinBalanceFor(plan);

    return this.solanaService.transfer({
      lamports: totalPrice,
      from: toKeypair(privateKey),
      to: BOT_ACCOUNT,

      // Use-Jito config
      ...(this.userJito
        ? {
            useJito: true,
            validatorTip: toLamports(BUY_PLAN_VALIDATOR_TIP_IN_SOL),
          }
        : {
            useJito: false,
            priorityFee: toLamports(BUY_PLAN_PRIORITY_FEE_IN_SOL),
          }),
    });
  }

  private getPlanPrice(plan: Plan): number {
    return toLamports(
      plan === "TOKEN_PASS"
        ? BOT_TOKEN_PASS_PRICE_IN_SOL
        : BOT_SERVICE_PASS_PRICE_IN_SOL
    );
  }
}
