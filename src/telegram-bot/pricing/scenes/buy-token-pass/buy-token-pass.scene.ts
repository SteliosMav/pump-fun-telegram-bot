import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../../../shared/constants";
import { PricingAction } from "../../constants";
import { PricingService } from "../../pricing.service";
import { toSol } from "../../../../core/solana";
import { BuyTokenPassViewService } from "./buy-token-pass-view.service";

@Scene(PricingAction.BUY_TOKEN_PASS)
export class BuyTokenPassScene {
  constructor(
    private readonly pricingService: PricingService,
    private readonly viewToken: BuyTokenPassViewService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const userBalance = await this.pricingService.getBalance(user.publicKey);
    const requiredBalance =
      this.pricingService.calculateFinalPriceFor("TOKEN_PASS");
    const hasSufficientBalance = userBalance >= requiredBalance;

    if (!hasSufficientBalance) {
      // === Insufficient Balance ===
      const message = this.viewToken.getInsufficientBalanceMsg(
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
      "TOKEN_PASS",
      user.getPrivateKey()
    );

    // === Update User ===
    await this.pricingService.incrementTokenPassesLeft(ctx.session);

    // === Success Message ===
    const message = this.viewToken.getSuccessMsg();
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      loadingMessage.message_id,
      undefined,
      message,
      { ...DEFAULT_REPLY_OPTIONS }
    );

    // === Redirect To Pricing ===
    ctx.scene.enter(SharedAction.RENDER_PRICING);
  }
}
