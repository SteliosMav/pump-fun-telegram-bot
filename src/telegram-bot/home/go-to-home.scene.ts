import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { HomeViewService } from "./home-view.service";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { HomeService } from "./home.service";

/**
 * @WARNING improvements:
 * 3) Add user's balance to the view. Consider storing it in the session and updating it
 *    after (a few seconds) the user bumps a meme coin or when user presses the refresh
 *    balance button.
 */

/**
 * This scene will act as a navigation to the home page by editing the previous
 * bot's message. It is used for when the user goes to another page and then wants
 * to click the "Back" button to go back to the homepage.
 */
@Scene(SharedAction.GO_TO_HOME)
export class GoToHomeScene {
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

    await ctx.editMessageText(message, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
