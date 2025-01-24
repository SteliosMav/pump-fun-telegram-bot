import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { HomeService } from "../home.service";
import { BotContext } from "../../bot.context";
import { BumpStatus } from "../types";

/**
 * @WARNING The bumping doesn't stop after the user cancels although the scene is left
 * and the cancellation message is sent. This is because the setTimeout is still
 * running.
 */

@Scene("startBumping")
export class StartBumpingScene {
  constructor(private readonly startService: HomeService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    ctx.session.bumpStatus = BumpStatus.BUMPING;
    await ctx.reply("Bumping started!");

    await this.startService.startBumping(ctx.from?.id);

    await ctx.reply("Bumping finished!");
    ctx.scene.leave();
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
