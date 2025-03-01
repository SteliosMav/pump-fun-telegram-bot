import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { HomeService } from "../../home.service";
import { BotContext } from "../../../bot.context";
import { HomeAction } from "../../constants";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../../../shared/constants";
import { StartBumpingSceneCtx } from "./types";
import { StartBumpingViewService } from "./start-bumping-view.service";

@Scene(HomeAction.START_BUMPING)
export class StartBumpingScene {
  constructor(
    private readonly homeService: HomeService,
    private readonly viewService: StartBumpingViewService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: StartBumpingSceneCtx) {
    const { mint } = ctx.scene.state;
    const { bumpingState: state } = ctx.session;

    // Start Bumping
    const startMsg = this.viewService.getBumpingStartedMsg();
    const keyboard = this.viewService.getCancelButton();
    await ctx.reply(startMsg, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: { inline_keyboard: keyboard },
    });
    await this.homeService.bump(ctx.session, mint);

    // Bump status response
    const responseMsg = this.viewService.getBumpDataMsg(state);
    await ctx.reply(responseMsg, { ...DEFAULT_REPLY_OPTIONS });

    // Redirect
    await ctx.scene.enter(SharedAction.RENDER_HOME);
  }

  /**
   * Cancel bumping if user interacts with the bot while the bumping is active.
   */
  @On(["text", "callback_query"])
  async onUserInteraction(@Ctx() ctx: BotContext) {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }
    await this.cancelBumping(ctx);
  }

  private async cancelBumping(ctx: BotContext) {
    ctx.session.bumpingState.cancelBy("USER_ACTIVITY");
    const message = this.viewService.getCancelingBumpingMsg();
    await ctx.reply(message, { ...DEFAULT_REPLY_OPTIONS });
    ctx.scene.leave();
  }
}
