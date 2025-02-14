import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { HomeService } from "../../home.service";
import { BotContext } from "../../../bot.context";
import { HomeAction } from "../../constants";
import { SharedAction } from "../../../shared/constants";
import { StartBumpingSceneCtx } from "./types";

/**
 * @WARNING The bumping doesn't stop after the user cancels although the scene is left
 * and the cancellation message is sent. This is because the setTimeout is still
 * running.
 */

@Scene(HomeAction.START_BUMPING)
export class StartBumpingScene {
  constructor(private readonly homeService: HomeService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: StartBumpingSceneCtx) {
    const { mint } = ctx.scene.state;

    // === Start Bumping ===
    await ctx.reply(`Bumping started for mint: ${mint}`);
    await this.homeService.bump(ctx.session, mint);

    // === Respond With Success ===
    await ctx.reply("Bumping finished!");
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
    await ctx.reply("Bumping cancelled due to user activity!");
    ctx.scene.leave();
  }
}
