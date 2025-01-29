import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { PricingViewService } from "../pricing-view.service";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../../shared/constants";
import { SolanaService } from "../../../core/solana/solana.service";
import { toPublicKey } from "../../../core/solana";
import { BUY_PASS_VALIDATOR_TIP, PricingAction } from "../constants";
import { BOT_PASS_PASS_PRICE_IN_SOL } from "../../../shared/constants";

@Scene(PricingAction.BUY_SERVICE_PASS)
export class BuyServicePassScene {
  constructor(
    private readonly pricingViewService: PricingViewService,
    private readonly solanaService: SolanaService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const balance = await this.solanaService.getBalance(
      toPublicKey(user.publicKey)
    );
    BUY_PASS_VALIDATOR_TIP;
    BOT_PASS_PASS_PRICE_IN_SOL;

    const txRes = await this.solanaService.transfer;

    // const message = this.pricingViewService.getMarkdown(user, balance);
    // const buttons = this.pricingViewService.getButtons();

    // await ctx.editMessageText(message, {
    //   ...DEFAULT_REPLY_OPTIONS,
    //   reply_markup: {
    //     inline_keyboard: buttons,
    //   },
    // });
  }
}
