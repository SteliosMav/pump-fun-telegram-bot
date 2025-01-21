import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { Scenes } from "telegraf";
import { StartService } from "../start.service";

/**
 * @WARNING The bumping doesn't stop after the user cancels although the scene is left
 * and the cancellation message is sent. This is because the setTimout is still
 * running.
 */

@Scene("startBumping")
export class StartBumpingScene {
  constructor(private readonly startService: StartService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Scenes.SceneContext) {
    if (!ctx.from) {
      return;
    }
    await ctx.reply("Bumping started!");

    await this.startService.startBumping(ctx.from?.id);

    await ctx.reply("Bumping finished!");
    ctx.scene.leave();
  }

  /** Cancel bumping if user takes whatever action, while the bumping is active */
  @On("text")
  async onText(@Ctx() ctx: Scenes.SceneContext) {
    await this.cancelBumping(ctx);
  }

  @On("callback_query")
  async onCallbackQuery(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.answerCbQuery();
    await this.cancelBumping(ctx);
  }

  private async cancelBumping(ctx: Scenes.SceneContext) {
    await ctx.reply("Bumping cancelled due to user activity!");
    ctx.scene.leave();
  }
}
