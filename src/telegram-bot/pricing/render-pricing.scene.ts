import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { PricingViewService } from "./pricing-view.service";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { SolanaService } from "../../core/solana/solana.service";
import { toPublicKey } from "../../core/solana";

@Scene(SharedAction.RENDER_PRICING)
export class RenderPricingScene {
  constructor(
    private readonly viewService: PricingViewService,
    private readonly solanaService: SolanaService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const balance = await this.solanaService.getBalance(user.publicKey);
    const message = this.viewService.getMessage(user, balance);
    const buttons = this.viewService.getButtons();

    await ctx.reply(message, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
