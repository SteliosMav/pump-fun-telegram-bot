import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { HomeService } from "../../home.service";
import { BotContext } from "../../../bot.context";
import { BumpStatus } from "../../types";
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
  constructor(private readonly startService: HomeService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: StartBumpingSceneCtx) {
    ctx.session.bumpStatus = BumpStatus.BUMPING;
    const { mint } = ctx.scene.state;

    // === Start bumping ===
    await ctx.reply(`Bumping started for mint: ${mint}`);
    await this.startService.bump(ctx.from?.id);

    // === Bump finished ===
    // Update user ...
    await ctx.reply("Bumping finished!");
    await ctx.scene.enter(SharedAction.RENDER_HOME);
  }

  /** Cancel bumping if user takes whatever action, while the bumping is active */
  @On("text")
  async onText(@Ctx() ctx: BotContext) {
    await this.cancelBumping(ctx);
  }

  @On("callback_query")
  async onCallbackQuery(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.cancelBumping(ctx);
  }

  private async cancelBumping(ctx: BotContext) {
    await ctx.reply("Bumping cancelled due to user activity!");
    ctx.scene.leave();
  }
}
