import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { Scenes } from "telegraf";

@Scene("start")
export class StartScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply("Welcome to the bot! Press a button to proceed.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Start Bumping", callback_data: "START_BUMPING" }],
          [{ text: "Settings", callback_data: "SETTINGS" }],
        ],
      },
    });
  }
}
