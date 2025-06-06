import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { HomeViewService } from "./home-view.service";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { HomeService } from "./home.service";

/**
 * @WARNING improvements:
 * 1) Add user's balance to the view. Consider storing it in the session and updating it
 *    after (a few seconds) the user bumps a meme coin or when user presses the refresh
 *    balance button.
 */

/**
 * This scene will render the home page by sending a new message to the user.
 * It is used for when the user types the /start command, or the bot must send
 * a new home page to the user after they entered a text or wizard steps.
 */
@Scene(SharedAction.RENDER_HOME)
export class RenderHomeScene {
  constructor(
    private readonly viewService: HomeViewService,
    private readonly homeService: HomeService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const balance = await this.homeService.getBalance(user.publicKey);
    const message = this.viewService.getMessage(user, balance);
    const buttons = this.viewService.getButtons();

    // If user had previously banned bot, unmark him
    if (user.telegram.hasBannedBot) {
      this.homeService.unmarkUserWhoBannedBot(ctx.session);
    }

    await ctx.reply(message, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
