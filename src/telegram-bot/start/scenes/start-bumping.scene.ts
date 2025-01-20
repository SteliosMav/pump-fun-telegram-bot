import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { Scenes } from "telegraf";

@Scene("startBumping")
export class StartBumpingScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply("Bumping started!");
  }
}
