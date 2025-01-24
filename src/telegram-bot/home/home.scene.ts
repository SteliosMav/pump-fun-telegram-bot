import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { HomeViewService } from "./home-view.service";
import { SharedAction } from "../shared/constants";
import { SolanaService } from "../../core/solana/solana.service";
import { toPublicKey } from "../../core/solana";

/**
 * @WARNING improvements:
 * 3) Add user's balance to the view. Consider storing it in the session and updating it
 *    after (a few seconds) the user bumps a meme coin.
 */

@Scene(SharedAction.HOME)
export class HomeScene {
  constructor(
    private readonly homeViewService: HomeViewService,
    private readonly solanaService: SolanaService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const balance = await this.solanaService.getBalance(
      toPublicKey(user.publicKey)
    );
    await ctx.reply(this.homeViewService.getMarkdown(user, balance), {
      parse_mode: "Markdown",
      link_preview_options: {
        is_disabled: true,
      },
      reply_markup: {
        inline_keyboard: this.homeViewService.getButtons(),
      },
    });
  }
}
