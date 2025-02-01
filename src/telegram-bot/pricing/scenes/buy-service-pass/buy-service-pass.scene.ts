import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { DEFAULT_REPLY_OPTIONS } from "../../../shared/constants";
import { PricingAction } from "../../constants";
import { PricingService } from "../../pricing.service";
import { toSol } from "../../../../core/solana";
import { BuyServicePassViewService } from "./buy-service-pass-view.service";

@Scene(PricingAction.BUY_SERVICE_PASS)
export class BuyServicePassScene {
  constructor(
    private readonly pricingService: PricingService,
    private readonly viewService: BuyServicePassViewService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const userBalance = await this.pricingService.getBalance(user.publicKey);
    const requiredBalance =
      this.pricingService.calculateFinalPriceFor("SERVICE_PASS");
    const hasSufficientBalance = userBalance >= requiredBalance;

    if (!hasSufficientBalance) {
      // === Insufficient Balance ===
      const message = this.viewService.getInsufficientBalanceMsg(
        toSol(requiredBalance)
      );
      await ctx.reply(message, { ...DEFAULT_REPLY_OPTIONS });
      return;
    }

    // === Transaction ===
    const loadingMessage = await ctx.reply(`Processing transaction...`, {
      ...DEFAULT_REPLY_OPTIONS,
    });
    const signature = await this.pricingService.buy(
      "SERVICE_PASS",
      user.getPrivateKey()
    );

    // === Update User ===
    await this.pricingService.addServicePass(ctx.session);

    // === Success Message ===
    const message = this.viewService.getSuccessMsg();
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      loadingMessage.message_id,
      undefined,
      message,
      { ...DEFAULT_REPLY_OPTIONS }
    );
  }
}
