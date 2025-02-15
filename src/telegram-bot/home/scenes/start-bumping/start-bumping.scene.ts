import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { HomeService } from "../../home.service";
import { BotContext } from "../../../bot.context";
import { HomeAction } from "../../constants";
import { SharedAction } from "../../../shared/constants";
import { StartBumpingSceneCtx } from "./types";
import { StartBumpingViewService } from "./start-bumping-view.service";

/**
 * @WARNING The bumping doesn't stop after the user cancels although the scene is left
 * and the cancellation message is sent. This is because the setTimeout is still
 * running.
 */

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
    await ctx.reply(startMsg);
    await this.homeService.bump(ctx.session, mint);

    // Bump status response
    const message = this.viewService.getBumpDataMsg(state);
    await ctx.reply(message, { parse_mode: "Markdown" });

    // Redirect
    await ctx.scene.enter(SharedAction.RENDER_HOME);
  }

  /**
   * Cancel bumping if user takes any action while the bumping is active.
   */
  @On(["text", "callback_query"])
  async onText(@Ctx() ctx: BotContext) {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }
    await this.cancelBumping(ctx);
  }

  private async cancelBumping(ctx: BotContext) {
    ctx.session.bumpingState.cancelBy("USER_ACTIVITY");
    const message = this.viewService.getCancelingBumpingMsg(
      ctx.session.bumpingState
    );
    await ctx.reply(message);
    ctx.scene.leave();
  }
}
